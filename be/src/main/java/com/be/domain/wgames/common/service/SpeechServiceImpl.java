package com.be.domain.wgames.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
public class SpeechServiceImpl implements SpeechService{

    private final String url;

    public SpeechServiceImpl(@Value("${url.ai}") String url) {
        this.url = url;
    }

    @Override
    public String SpeechToText(MultipartFile file) throws IOException {
        WebClient webClient = WebClient.builder().baseUrl(url).build();

        // 요청을 보내고 응답을 Map<String, String> 형태로 받음
        Mono<Map<String, String>> responseMono = webClient.post()
                .uri("/ai/stt")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();  // 원본 파일명 유지
                    }
                }))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {});  // 제네릭 타입 명시

        // 응답에서 "recognized_text" 필드를 추출
        Map<String, String> response = responseMono.block();  // block()으로 응답을 기다림
        String recognizedText = response != null ? response.get("recognized_text") : null;

        // recognized_text가 null이 아니면 반환, 아니면 빈 문자열 반환
        return recognizedText != null ? recognizedText : "";
    }
}
