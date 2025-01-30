package com.be.domain.session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class SignalingHandler extends TextWebSocketHandler {

	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		String sessionId = session.getId();
		sessions.put(sessionId, session);
		System.out.println("✅ WebRTC WebSocket 연결됨: " + sessionId);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

		// ✅ JSON 필드 유효성 검사
		String sender = jsonMessage.has("sender") ? jsonMessage.get("sender").asText() : "Unknown";
		String text = jsonMessage.has("text") ? jsonMessage.get("text").asText() : "";

		System.out.println("📩 받은 메시지: " + sender + " → " + text);

		for (WebSocketSession s : sessions.values()) {
			if (s != null && s.isOpen() && !s.getId().equals(session.getId())) {
				s.sendMessage(message);
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		sessions.remove(session.getId());
		System.out.println("🔴 WebRTC WebSocket 연결 종료: " + session.getId());
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		sessions.remove(session.getId());
		session.close(CloseStatus.SERVER_ERROR);
		System.err.println("❌ WebSocket 오류 발생: " + exception.getMessage());
	}

	private void sendMessage(WebSocketSession session, JsonNode message) throws Exception {
		if (session.isOpen()) {
			session.sendMessage(new TextMessage(message.toString()));
		}
	}
}
