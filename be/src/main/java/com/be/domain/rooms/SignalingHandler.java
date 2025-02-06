package com.be.domain.rooms;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

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

	private final Map<Long, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		// ✅ 방 ID 가져오기
		Long userId = (Long) session.getAttributes().get("user");
		Long roomId = (Long) session.getAttributes().get("roomId");

		if (userId != null && roomId != null) {
			// ✅ 방이 없으면 새로 생성
			rooms.putIfAbsent(roomId, new CopyOnWriteArraySet<>());
			rooms.get(roomId).add(session); // ✅ 해당 방에 WebSocket 세션 추가

			log.info("✅ WebRTC WebSocket 연결됨 - 사용자 ID: {} / 방 ID: {}", userId, roomId);
		} else {
			log.info("❌ WebRTC 연결 실패 - 사용자 ID 또는 방 ID 없음");
			session.close(CloseStatus.NOT_ACCEPTABLE);
		}
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
		Long roomId = (Long) session.getAttributes().get("roomId"); // ✅ 방 ID 가져오기

		if (roomId == null) {
			log.warn("❌ 방 ID 없음 - 메시지 전송 불가");
			return;
		}

		log.info("📩 받은 메시지: 방 ID {} - {}", roomId, jsonMessage);

		Set<WebSocketSession> sessions = rooms.get(roomId);
		if (sessions != null) {
			for (WebSocketSession s : sessions) {
				if (s.isOpen() && !s.equals(session)) { // ✅ 같은 방이면서 본인 제외
					s.sendMessage(message);
				}
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Long userId = (Long) session.getAttributes().get("user");
		Long roomId = (Long) session.getAttributes().get("roomId");

		if (roomId != null) {
			Set<WebSocketSession> sessions = rooms.get(roomId);
			if (sessions != null) {
				sessions.remove(session);
				if (sessions.isEmpty()) { // ✅ 방에 사람이 없으면 삭제
					rooms.remove(roomId);
				}
			}
		}

		log.info("🔴 WebRTC WebSocket 연결 종료 - 사용자 ID: {} / 방 ID: {}", userId, roomId);
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		Long userId = (Long) session.getAttributes().get("user");
		Long roomId = (Long) session.getAttributes().get("roomId");

		if (roomId != null) {
			Set<WebSocketSession> sessions = rooms.get(roomId);
			if (sessions != null) {
				sessions.remove(session);
				if (sessions.isEmpty()) {
					rooms.remove(roomId);
				}
			}
		}

		log.info("❌ WebSocket 오류 발생 - 사용자 ID: {} / 방 ID: {} / 오류: {}", userId, roomId, exception.getMessage());
		session.close(CloseStatus.SERVER_ERROR);
	}
}
