package com.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.be.common.auth.service.TokenService;
import com.be.domain.rooms.SignalingHandler;
import com.be.domain.rooms.AudioWebSocketHandler;
import com.be.common.auth.WebSocketAuthInterceptor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final SignalingHandler signalingHandler;
	private final AudioWebSocketHandler audioWebSocketHandler;
	private final TokenService tokenService; // 🔥 JWT 인증을 위한 서비스 추가

	// ✅ Spring에서 의존성 주입 받도록 변경
	public WebSocketConfig(SignalingHandler signalingHandler, AudioWebSocketHandler audioWebSocketHandler, TokenService tokenService) {
		this.signalingHandler = signalingHandler;
		this.audioWebSocketHandler = audioWebSocketHandler;
		this.tokenService = tokenService;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		// 🔥 WebSocket 요청이 들어오면 WebSocketAuthInterceptor를 사용하여 JWT 검증 수행
		registry.addHandler(signalingHandler, "/WebRTC/signaling")
			.addInterceptors(new WebSocketAuthInterceptor(tokenService)) // ✅ 인증 인터셉터 추가
			.setAllowedOrigins("*");

		registry.addHandler(audioWebSocketHandler, "/WebRTC/audio")
			.addInterceptors(new WebSocketAuthInterceptor(tokenService)) // ✅ 인증 인터셉터 추가
			.setAllowedOrigins("*");

		log.info("✅ WebSocket 핸들러 등록 완료: /WebRTC/signaling (JWT 인증 포함)");
		log.info("✅ WebSocket 핸들러 등록 완료: /WebRTC/audio (JWT 인증 포함)");

	}
}
