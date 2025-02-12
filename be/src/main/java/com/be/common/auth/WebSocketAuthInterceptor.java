package com.be.common.auth;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.HashMap;
import java.util.Map;

import com.be.common.auth.service.TokenService;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.TokenErrorCode;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

	private final TokenService tokenService;

	public WebSocketAuthInterceptor(TokenService tokenService) {
		this.tokenService = tokenService;
	}

	@Override
	public boolean beforeHandshake(
			ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {
		log.info("🔹 WebSocket 인터셉터 실행됨");
		Map<String, String> params = extractParamsFromRequest(request);
		String token = params.get("token");
		String roomId = params.get("roomId"); // ✅ roomId 추가

		log.info("🔍 WebSocket Handshake 시도, 받은 토큰: {}, 방 ID: {}", token, roomId);

		if (token == null || roomId == null) {
			log.info("❌ WebSocket 인증 실패: 토큰 또는 roomId가 전달되지 않음");
			return false;
		}

		if (!tokenService.validateToken(token)) {
			log.info("❌ WebSocket 인증 실패: 유효하지 않은 토큰");
			return false;
		}

		try {
			Long userId = tokenService.extractUserIdFromToken(token)
					.orElseThrow(() -> new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN));

			attributes.put("user", userId);  // ✅ 세션에 사용자 ID 저장
			attributes.put("roomId", roomId); // ✅ 세션에 방 ID 저장

			log.info("✅ WebSocket 인증 성공, 사용자 ID: {}, 방 ID: {}", userId, roomId);
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
	private Map<String, String> extractParamsFromRequest(ServerHttpRequest request) {
		String query = request.getURI().getQuery();
		Map<String, String> params = new HashMap<>();

		if (query == null) {
			return params;
		}

		// ✅ `token=xxx&roomId=yyy` 형태에서 각각 추출
		for (String param : query.split("&")) {
			String[] keyValue = param.split("=");
			if (keyValue.length == 2) {
				params.put(keyValue[0], keyValue[1]);
			}
		}

		return params;
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
		WebSocketHandler wsHandler, Exception exception) {
		// 필요 시 후처리
	}
}
