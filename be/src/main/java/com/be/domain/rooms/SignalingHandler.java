package com.be.domain.rooms;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SignalingHandler extends TextWebSocketHandler {
	// ✅ 방 ID별 WebSocket 세션을 저장하는 구조
	private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		log.info("✅ WebRTC WebSocket 연결됨: {}", session.getId());
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
		log.info("📩 받은 메시지: {}", message.getPayload());

		String type = jsonMessage.has("type") ? jsonMessage.get("type").asText() : "unknown";
		String roomId = jsonMessage.has("room_id") ? jsonMessage.get("room_id").asText() : null;
		String userId = jsonMessage.has("user_id") ? jsonMessage.get("user_id").asText() : null;

		if (roomId == null) {
			log.info("⚠️ 메시지 전송 취소 - room_id 없음");
			return;
		}

		switch (type) {
			case "join":
				joinRoom(session, roomId);
				break;
			case "chat":
			case "offer":
			case "items":
			case "answer":
			case "choice":
			case "candidate":
			case "answerChoice":
				broadcast(roomId, message, session);
				break;
			default:
				log.warn("⚠️ 알 수 없는 메시지 타입: {}", type);
		}
	}

	//해당 세션을 방에 추가함
	private void joinRoom(WebSocketSession session, String roomId) {
		rooms.computeIfAbsent(roomId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()));
		rooms.get(roomId).add(session);
		log.info("👥 사용자 {} 방 {} 참여", session.getId(), roomId);
	}

	//해당 방의 세션들에게 메세지 전파
	private void broadcast(String roomId, TextMessage message, WebSocketSession senderSession) throws Exception {
		if (!rooms.containsKey(roomId)) {
			log.info("⚠️ 방 {} 존재하지 않음", roomId);
			return;
		}

		log.info("📢 방 {} 에 속한 사용자들에게 메시지 전송", roomId);
		for (WebSocketSession session : rooms.get(roomId)) {
			log.info("📡 메시지 전송 대상 사용자 ID: {}", session.getId());
			if (session.isOpen() && !session.getId().equals(senderSession.getId())) {
				session.sendMessage(message);
				log.info("보냄");
			}
		}
	}

	//세션 종료 시 소켓 정리
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		rooms.values().forEach(sessions -> sessions.remove(session));
		log.info("🔴 WebRTC WebSocket 연결 종료: {}", session.getId());
	}
}
