package com.be.domain.rooms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler {

	private final WebClient webClient;

	public AudioWebSocketHandler(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl("http://3.39.252.223:5000/ai/stt").build(); // STT 서버 URL
	}

	@Override
	protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws IOException {
		System.out.println("🎙️ 오디오 데이터 수신");

		// ✅ 1. 오디오 파일 저장
		File audioFile = new File("audio.wav");
		try (FileOutputStream fos = new FileOutputStream(audioFile)) {
			fos.write(message.getPayload().array());
		}

		// ✅ 2. STT 변환 요청 보내기
		String transcript = sendToSTT(audioFile);

		// ✅ 3. 변환된 텍스트를 클라이언트에게 WebSocket을 통해 전송
		if (session.isOpen()) {
			session.sendMessage(new TextMessage(transcript));
		}

		// ✅ 4. 파일 삭제 (메모리 절약)
		audioFile.delete();
	}

	private String sendToSTT(File file) {
		MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
		bodyBuilder.part("file", new FileSystemResource(file)).contentType(MediaType.MULTIPART_FORM_DATA);

		return webClient.post()
			.body(BodyInserters.fromMultipartData(bodyBuilder.build()))
			.retrieve()
			.bodyToMono(String.class)
			.map(response -> {
				try {
					ObjectMapper objectMapper = new ObjectMapper();
					JsonNode rootNode = objectMapper.readTree(response);
					return rootNode.path("recognized_text").asText(); // AI 서버에서 변환된 텍스트 가져오기

				} catch (Exception e) {
					return "❌ STT 변환 실패";
				}
			}).block();
	}
}
