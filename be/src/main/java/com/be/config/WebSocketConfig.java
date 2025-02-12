package com.be.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.be.common.auth.service.TokenService;
import com.be.domain.rooms.SignalingHandler;
import com.be.domain.rooms.AudioWebSocketHandler;
import com.be.common.auth.WebSocketAuthInterceptor;

import lombok.extern.slf4j.Slf4j;
@RequiredArgsConstructor
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final SignalingHandler signalingHandler;
	private final AudioWebSocketHandler audioWebSocketHandler;
	private final WebSocketAuthInterceptor webSocketAuthInterceptor;
	private final TokenService tokenService; // 🔥 JWT 인증을 위한 서비스 추가

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		// ✅ 기존에 주입된 `webSocketAuthInterceptor` 사용
		registry.addHandler(signalingHandler, "/WebRTC/signaling", "/rooms")
				.addInterceptors(webSocketAuthInterceptor) // ✅ 기존 빈 사용
				.setAllowedOrigins("*");
		log.info("✅ WebSocket 핸들러 등록 완료: /WebRTC/signaling (인터셉터 포함)");

		registry.addHandler(audioWebSocketHandler, "/WebRTC/audio")
				.addInterceptors(webSocketAuthInterceptor) // ✅ 기존 빈 사용
				.setAllowedOrigins("*");
		log.info("✅ WebSocket 핸들러 등록 완료: /WebRTC/audio (인터셉터 포함)");
	}

}
