package com.be.domain.rooms;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class Aihi {

	private final WebClient webClient;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private static final String STT_SERVER_URL = "http://3.39.252.223:5000/ai/stt";

	public Aihi() {
		this.webClient = WebClient.create(STT_SERVER_URL);
	}

	/**
	 * 오디오 파일을 STT 서버에 전송하여 텍스트 변환
	 *
	 * @param file 변환할 오디오 파일
	 * @return 변환된 텍스트
	 */
	public String speechToText(FileSystemResource file) {
		log.info("🎙️ STT 변환 요청: {}", file.getFilename());

		MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
		bodyBuilder.part("file", file)
			.filename("audio.wav")
			.contentType(MediaType.parseMediaType("audio/wav"));

		try {
			// STT 요청 및 응답 처리
			String response = webClient.post()
				.contentType(MediaType.MULTIPART_FORM_DATA)
				.body(BodyInserters.fromMultipartData(bodyBuilder.build()))
				.retrieve()
				.bodyToMono(String.class)
				.block();

			// JSON 파싱 및 변환된 텍스트 반환
			JsonNode rootNode = objectMapper.readTree(response);
			String recognizedText = rootNode.path("recognized_text").asText();

			log.info("✅ STT 변환 결과: {}", recognizedText);
			return recognizedText.isEmpty() ? "변환 실패" : recognizedText;

		} catch (Exception e) {
			log.error("❌ STT 요청 실패: {}", e.getMessage());
			return "STT 변환 중 오류 발생";
		}
	}
}
