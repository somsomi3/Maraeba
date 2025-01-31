package com.be.domain.wgames;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;

@Service
public class AiTest {

    public String speechToText(FileSystemResource file) throws JsonProcessingException {
        System.out.println("STT 테스트");
        String url = "http://3.39.252.223:5000/ai/stt"; // 요청을 보낼 URL

        // WebClient 생성
        WebClient webClient = WebClient.builder().baseUrl(url).build();


        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();

        bodyBuilder.part("file", file)
                .filename("audio.wav")
                .contentType(MediaType.parseMediaType("audio/wav"));

        // POST 요청 전송
        String answer = webClient.post()
                .uri("")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        return objectMapper.readTree(response).toString(); // JSON 변환
                    } catch (Exception e) {
                        return response;
                    }
                }).block();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(answer); // JSON 문자열 파싱

        // "text" 필드 추출
        return rootNode.path("recognized_text").asText();
    }

    public static void main(String[] args) {
        String url = "http://3.39.252.223:5000/ai/stt"; // 요청을 보낼 URL

        // WebClient 생성
        WebClient webClient = WebClient.builder().baseUrl(url).build();


        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();

        bodyBuilder.part("file", new FileSystemResource("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\audio\\audio.wav"))
                .filename("audio.wav")
                .contentType(MediaType.parseMediaType("audio/wav"));
        // POST 요청 전송
        String answer = webClient.post()
                .uri("")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        return objectMapper.readTree(response).toString(); // JSON 변환
                    } catch (Exception e) {
                        return response;
                    }
                }).block();

        // 응답 출력
        System.out.println(answer);

    }
}
