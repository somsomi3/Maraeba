package com.be.domain.chatbot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class OpenAiClient {

    @Value("${openai.api-key}") // application.properties에서 API 키를 가져옴
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String getResponse(List<String> chatHistory, String userMessage) throws JsonProcessingException {
        // 대화 이력을 messages 배열로 변환
        List<Map<String, String>> messages = new ArrayList<>();

        // 시스템 메시지 추가
        messages.add(Map.of("role", "system", "content", "You are a helpful assistant."));

        // 이전 대화 이력 추가
        for (String message : chatHistory) {
            messages.add(Map.of("role", "user", "content", message));
        }

        // 현재 사용자 메시지 추가
        messages.add(Map.of("role", "user", "content", userMessage));

        // OpenAI API에 요청할 데이터 생성 (JSON)
        String jsonPayload = objectMapper.writeValueAsString(Map.of(
                "model", "gpt-4o-mini",
                "messages", messages
        ));

        // API 호출을 위한 헤더 설정 (API 키 포함)
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        // 요청 본문과 헤더를 포함한 HttpEntity 생성
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        // API 호출
        String url = "https://api.openai.com/v1/chat/completions";
        ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // API 응답에서 텍스트만 추출하여 반환
        return extractResponseText(responseEntity.getBody());
    }

    private String extractResponseText(String apiResponse) {
        // 응답에서 필요한 텍스트 부분을 추출하는 로직 (예시로 간단히 파싱)
        // 실제로는 JSON 파싱 라이브러리를 사용해서 응답을 처리하는 것이 좋음

        try {
            // JSON 응답에서 "choices" 배열의 첫 번째 요소를 가져옴
            Map<String, Object> responseMap = objectMapper.readValue(apiResponse, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

            // message의 content 필드 추출
            return (String) message.get("content");

        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return "Error parsing response";
        }
    }
}
