package com.be.domain.rooms;

import com.be.domain.rooms.request.RoomRemoveRequest;
import com.be.domain.rooms.request.UserLeaveRequest;
import com.be.domain.rooms.service.RoomService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class SignalingHandler extends TextWebSocketHandler {

	private final RoomService roomService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	/**
	 * rooms:
	 * key   = roomId
	 * value = 해당 방에 연결된 WebSocketSession의 집합
	 */
	private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		log.info("✅ WebRTC WebSocket 연결됨: {}", session.getId());
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

		String type = jsonMessage.has("type") ? jsonMessage.get("type").asText() : "unknown";
		String roomId = jsonMessage.has("room_id") ? jsonMessage.get("room_id").asText() : null;
		String userId = jsonMessage.has("user_id") ? jsonMessage.get("user_id").asText() : null;

		log.info("📩 받은 메시지: {}", message.getPayload());

		// ping 메시지는 단순 연결 유지 용도로 보통 무시
		if ("ping".equals(type)) {
			log.debug("📡 Ping 메시지 수신 - 사용자: {}", session.getId());
			return;
		}

		// room_id나 user_id가 없으면 처리 불가
		if (roomId == null || userId == null) {
			log.warn("⚠️ room_id 또는 user_id 누락으로 메시지 처리 불가");
			return;
		}

		switch (type) {
			case "join":
				joinRoom(session, roomId);
				break;

			case "leave":
				leaveRoom(session, roomId);
				// DB에서도 해당 User를 방에서 나가게 처리
				roomService.leaveRoom(
					UserLeaveRequest.of(Long.valueOf(userId), roomId)
				);
				break;

			// 채팅, offer/answer, candidate 등은 방 전체 브로드캐스트
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

	/**
	 * 방 참여 처리
	 */
	private void joinRoom(WebSocketSession session, String roomId) {
		rooms.computeIfAbsent(roomId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()));
		rooms.get(roomId).add(session);
		log.info("👥 사용자 {} 방 {} 참여", session.getId(), roomId);
	}

	/**
	 * 방 떠나기 처리
	 */
	private void leaveRoom(WebSocketSession session, String roomId) {
		if (rooms.containsKey(roomId)) {
			Set<WebSocketSession> sessions = rooms.get(roomId);
			sessions.remove(session);
			log.info("🚪 사용자 {} 방 {} 떠남", session.getId(), roomId);

			// 방에 남은 사람이 없으면 제거 + DB에서도 삭제
			if (sessions.isEmpty()) {
				rooms.remove(roomId);
				roomService.removeRoom(RoomRemoveRequest.of(roomId));
			}
		}
	}

	/**
	 * 방 내 모든 사용자에게 메시지 전송
	 */
	private void broadcast(String roomId, TextMessage message, WebSocketSession senderSession) throws Exception {
		if (!rooms.containsKey(roomId)) {
			log.warn("⚠️ 방 {} 존재하지 않음", roomId);
			return;
		}

		log.info("📢 방 {} 에 속한 사용자들에게 메시지 전송", roomId);
		for (WebSocketSession session : rooms.get(roomId)) {
			// 본인에게는 보내지 않음(필요 시 조정 가능)
			if (session.isOpen() && !session.getId().equals(senderSession.getId())) {
				session.sendMessage(message);
				log.debug("   → 메시지 전송 대상: {}", session.getId());
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		// 연결 끊길 때 세션이 속한 모든 방에서 제거
		rooms.values().forEach(sessions -> sessions.remove(session));
		log.info("🔴 WebRTC WebSocket 연결 종료: {}", session.getId());
	}
}
