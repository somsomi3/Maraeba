package com.be.common.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class WebSocketAuthInterceptor implements HandshakeInterceptor {

	private final TokenService tokenService;

	public WebSocketAuthInterceptor(TokenService tokenService) {
		this.tokenService = tokenService;
	}

	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
		WebSocketHandler wsHandler, Map<String, Object> attributes) {
		if (request instanceof ServletServerHttpRequest) {
			HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
			String token = servletRequest.getParameter("token");

			if (token != null && tokenService.validateToken(token)) {
				Long userId = tokenService.extractUserIdFromToken(token);
				attributes.put("userId", userId); // ✅ 인증된 userId 저장
				return true;
			}
		}
		return false; // ❌ 인증 실패 시 WebSocket 연결 차단
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
		WebSocketHandler wsHandler, Exception exception) {
		// 필요 시 후처리
	}
}
