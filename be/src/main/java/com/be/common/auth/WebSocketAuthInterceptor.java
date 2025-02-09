package com.be.common.auth;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

import com.be.common.auth.service.TokenService;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.TokenErrorCode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

	private final TokenService tokenService;

	public WebSocketAuthInterceptor(TokenService tokenService) {
		this.tokenService = tokenService;
	}

	@Override
	public boolean beforeHandshake(
		ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {

		String token = extractTokenFromRequest(request);
		log.info("🔍 WebSocket Handshake 시도, 받은 토큰: {}", token);

		if (token == null) {
			log.info("❌ WebSocket 인증 실패: 토큰이 전달되지 않음");
			return false;
		}

		if (!tokenService.validateToken(token)) {
			log.info("❌ WebSocket 인증 실패: 유효하지 않은 토큰");
			return false;
		}

		try {
			Long userId = tokenService.extractUserIdFromToken(token)
				.orElseThrow(() -> new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN));
			attributes.put("user", userId); // 세션에 사용자 ID 저장
			log.info("✅ WebSocket 인증 성공, 사용자 ID: {}", userId);
			return true;
		} catch (CustomTokenException e) {
			log.info("❌ WebSocket 인증 실패: 사용자 ID 추출 실패 - {}", e.getMessage());
			return false;
		} catch (Exception e) {
			log.info("❌ WebSocket 인증 실패: 알 수 없는 오류 발생 - {}", e.getMessage());
			return false;
		}
	}

	/**
	 * WebSocket 요청에서 JWT 토큰을 추출
	 */
	private String extractTokenFromRequest(ServerHttpRequest request) {
		// ✅ Query String 에서 `token=` 값 찾기 (예: ws://localhost:8081/WebRTC/signaling?token=xxxxx)
		String query = request.getURI().getQuery();

		if (query == null) {
			return null;
		}

		// 여러 개의 파라미터가 올 수 있으므로 `&` 기준으로 나눔
		for (String param : query.split("&")) {
			if (param.startsWith("token=")) {
				return param.substring(6);
			}
		}
		return null;
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
		WebSocketHandler wsHandler, Exception exception) {
		// 필요 시 후처리
	}
}
