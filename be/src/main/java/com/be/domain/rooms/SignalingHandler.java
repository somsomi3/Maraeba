package com.be.domain.rooms;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.stream.Collectors;

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

	// ✅ 방을 관리하는 ConcurrentHashMap (방 ID → WebSocket 세션 목록)
	private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		log.info("🔹 WebSocket 연결 요청 감지됨");
		System.out.println("✅ afterConnectionEstablished 실행됨!");
		// ✅ WebSocketAuthInterceptor에서 설정한 roomId 및 userId 가져오기
		String roomId = (String) session.getAttributes().get("roomId");
		Long userId = (Long) session.getAttributes().get("user");
		System.out.println("afterConnectionEstablished 들어옴!!!!!!!!!!!!!!!");
		if (roomId != null && userId != null) {
			// ✅ 방이 없으면 새로 생성 후 참가자 추가
			rooms.computeIfAbsent(roomId, k -> new CopyOnWriteArraySet<>()).add(session);

			log.info("✅ WebRTC WebSocket 연결됨 - 방 ID: {}, 사용자 ID: {}", roomId, userId);

			// ✅ 방 참가 메시지 전송
			String joinMessage = "{\"type\": \"join\", \"roomId\": \"" + roomId + "\", \"userId\": " + userId + "}";
			broadcast(roomId, new TextMessage(joinMessage), session);
		} else {
			log.info("❌ WebRTC 연결 실패 - 방 ID 또는 사용자 ID 없음");
			session.close(CloseStatus.NOT_ACCEPTABLE);
		}
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

		// ✅ 메시지에서 방 ID 가져오기
		String roomId = jsonMessage.has("roomId") ? jsonMessage.get("roomId").asText() : null;
		String sender = jsonMessage.has("sender") ? jsonMessage.get("sender").asText() : "Unknown";
		String text = jsonMessage.has("text") ? jsonMessage.get("text").asText() : "";

		if (roomId == null || !rooms.containsKey(roomId)) {
			log.info("⚠️ 메시지 전송 취소 - 존재하지 않는 방 ID: {}", roomId);
			return;
		}

		log.info("📩 받은 메시지 (방 {}): {} → {}", roomId, sender, text);

		// ✅ 같은 방에 있는 모든 사용자에게 메시지 전송 (본인 제외)
		broadcast(roomId, message, session);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		String roomId = (String) session.getAttributes().get("roomId");
		Long userId = (Long) session.getAttributes().get("user");

		if (roomId != null && userId != null) {
			// ✅ 방에서 사용자 제거
			rooms.computeIfPresent(roomId, (key, users) -> {
				users.remove(session);
				return users.isEmpty() ? null : users; // 방이 비었으면 삭제
			});

			log.info("🔴 WebRTC WebSocket 연결 종료 - 방 ID: {}, 사용자 ID: {}", roomId, userId);

			// ✅ 나간 사용자 정보 전송
			String leaveMessage = "{\"type\": \"leave\", \"roomId\": \"" + roomId + "\", \"userId\": " + userId + "}";
			broadcast(roomId, new TextMessage(leaveMessage), session);
			// ✅ 업데이트된 방 참가자 목록 전송
			String userListMessage = "{\"type\": \"userList\", \"roomId\": \"" + roomId + "\", \"users\": " + getRoomUserIds(roomId) + "}";
			broadcast(roomId, new TextMessage(userListMessage), null);
		} else {
			log.info("🔴 WebRTC WebSocket 연결 종료 - ID 없음");
		}
	}
	public Set<Long> getRoomUserIds(String roomId) {
		System.out.println("여기왓디.");
		return rooms.getOrDefault(roomId, new CopyOnWriteArraySet<>()).stream()
				.map(session -> (Long) session.getAttributes().get("user"))
				.collect(Collectors.toSet());
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		String roomId = (String) session.getAttributes().get("roomId");
		Long userId = (Long) session.getAttributes().get("user");

		if (roomId != null && userId != null) {
			rooms.computeIfPresent(roomId, (key, users) -> {
				users.remove(session);
				return users.isEmpty() ? null : users;
			});

			log.info("❌ WebSocket 오류 발생 - 방 ID: {}, 사용자 ID: {} / 오류: {}", roomId, userId, exception.getMessage());
		} else {
			log.info("❌ WebSocket 오류 발생 - 사용자 ID 없음 / 오류: {}", exception.getMessage());
		}

		session.close(CloseStatus.SERVER_ERROR);
	}

	// ✅ 같은 방 사용자에게 메시지 전송 (본인은 제외)
	private void broadcast(String roomId, TextMessage message, WebSocketSession senderSession) throws Exception {
		Set<WebSocketSession> users = rooms.getOrDefault(roomId, new CopyOnWriteArraySet<>());
		for (WebSocketSession s : users) {
			if (s.isOpen() && !s.equals(senderSession)) {
				s.sendMessage(message);
			}
		}
	}
}
