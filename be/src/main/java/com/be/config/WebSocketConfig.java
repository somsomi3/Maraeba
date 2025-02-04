package com.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.be.domain.rooms.SignalingHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final SignalingHandler signalingHandler;

	// ✅ Spring에서 주입받도록 변경
	public WebSocketConfig(SignalingHandler signalingHandler) {
		this.signalingHandler = signalingHandler;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(signalingHandler, "/WebRTC/signaling").setAllowedOrigins("*");
		System.out.println("WebSocket 핸들러 등록 완료: /WebRTC/signaling");
	}
}
