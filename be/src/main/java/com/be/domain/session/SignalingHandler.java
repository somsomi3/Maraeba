package com.be.domain.session;


import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

public class SignalingHandler extends TextWebSocketHandler {

	private final List<WebSocketSession> sessions = new ArrayList<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		sessions.add(session);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		for (WebSocketSession s : sessions) {
			if (s != null && s.isOpen() && !s.getId().equals(session.getId())) {
				s.sendMessage(message);
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		sessions.remove(session);
	}

	// Null Pointer Exception 처리
	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		sessions.remove(session);
		session.close(CloseStatus.SERVER_ERROR);
	}
}
