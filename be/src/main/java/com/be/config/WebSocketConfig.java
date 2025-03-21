package com.be.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.be.common.auth.service.TokenService;
import com.be.domain.rooms.SignalingHandler;

import com.be.common.auth.WebSocketAuthInterceptor;

import lombok.extern.slf4j.Slf4j;
@RequiredArgsConstructor
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final SignalingHandler signalingHandler;
	private final TokenService tokenService; // 🔥 JWT 인증을 위한 서비스 추가

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		// 🔥 WebSocket 요청이 들어오면 WebSocketAuthInterceptor를 사용하여 JWT 검증 수행
		registry.addHandler(signalingHandler, "/WebRTC/signaling")
				.addInterceptors(new WebSocketAuthInterceptor(tokenService)) // ✅ 인증 인터셉터 추가
		 .setAllowedOriginPatterns("*");


		log.info("✅ WebSocket 핸들러 등록 완료: /WebRTC/signaling (JWT 인증 포함)");

	}
}
