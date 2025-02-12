package com.be.domain.rooms;

import java.util.Map;
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

	private final Map<Long, WebSocketSession> rooms = new ConcurrentHashMap<>();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		// ✅ WebSocketAuthInterceptor에서 설정한 userId 가져오기
		Long userId = (Long) session.getAttributes().get("user");

		if (userId != null) {
			rooms.put(userId, session);
			log.info("✅ WebRTC WebSocket 연결됨 - 사용자 ID: {}", userId);
			// ✅ 사용자 ID를 WebSocket 메시지로 클라이언트에게 전송
			String userIdMessage = "{\"type\": \"userId\", \"userId\": " + userId + "}";
			session.sendMessage(new TextMessage(userIdMessage));
		} else {
			log.info("❌ WebRTC 연결 실패 - 사용자 ID 없음");
			session.close(CloseStatus.NOT_ACCEPTABLE);
		}
	}

	@Override
	protected void handleTextMessage(WebSocketSession room, TextMessage message) throws Exception {
		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

		// ✅ JSON 필드 유효성 검사
		String sender = jsonMessage.has("sender") ? jsonMessage.get("sender").asText() : "Unknown";
		String text = jsonMessage.has("text") ? jsonMessage.get("text").asText() : "";

		log.info("📩 받은 메시지: {} → {}", sender, text);

		for (WebSocketSession s : rooms.values()) {
			if (s != null && s.isOpen() && !s.getId().equals(room.getId())) {
				s.sendMessage(message);
			}
		}

		// // ✅ 빈 메시지 또는 유효하지 않은 sender는 처리하지 않음
		// if ("Unknown".equals(sender) || text.isBlank()) {
		// 	log.info("⚠️ 메시지 전송 취소 - sender 또는 text가 유효하지 않음");
		// 	return;
		// }
		//
		// // ✅ 모든 WebSocket 세션에 메시지 전송 (본인 제외)
		// for (WebSocketSession s : rooms.values()) {
		// 	if (s != null && s.isOpen() && !s.equals(session)) {
		// 		s.sendMessage(message);
		// 	}
		// }
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Long userId = (Long) session.getAttributes().get("user");

		if (userId != null) {
			rooms.remove(userId);
			log.info("🔴 WebRTC WebSocket 연결 종료 - 사용자 ID: {}", userId);
		} else {
			log.info("🔴 WebRTC WebSocket 연결 종료 - ID 없음");
		}
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		Long userId = (Long) session.getAttributes().get("user");

		if (userId != null) {
			rooms.remove(userId);
			log.info("❌ WebSocket 오류 발생 - 사용자 ID: {} / 오류: {}", userId, exception.getMessage());
		} else {
			log.info("❌ WebSocket 오류 발생 - 사용자 ID 없음 / 오류: {}", exception.getMessage());
		}

		session.close(CloseStatus.SERVER_ERROR);
	}

	private void sendMessage(WebSocketSession session, JsonNode message) throws Exception {
		if (session.isOpen()) {
			session.sendMessage(new TextMessage(message.toString()));
		}
	}


}
