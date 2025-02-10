package com.be.domain.chatbot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService{

    private final RedisTemplate<String, String> redisTemplate;
    private final OpenAiClient openAiClient;

    private static final int MAX_HISTORY = 10; // 최근 10개 대화만 유지

    @Override
    public String chat(String sessionId, String userMessage) throws JsonProcessingException {
        String historyKey = "user:" + sessionId + ":history";
        String summaryKey = "user:" + sessionId + ":summary";

        // Redis에서 기존 대화 내역 가져오기
        List<String> chatHistory = redisTemplate.opsForList().range(historyKey, 0, -1);
        if (chatHistory == null) {
            chatHistory = new ArrayList<>();
        }

        // OpenAI API 호출 (이전 대화 포함)
        String response = openAiClient.getResponse(chatHistory, userMessage);

        // Redis에 새 대화 저장
        redisTemplate.opsForList().rightPush(historyKey, "User: " + userMessage);
        redisTemplate.opsForList().rightPush(historyKey, "AI: " + response);


        // 대화 길이 제한 → 초과하면 앞에서 삭제
        while (redisTemplate.opsForList().size(historyKey) > MAX_HISTORY) {
            redisTemplate.opsForList().leftPop(historyKey);
        }

        // 오래된 대화 요약 후 저장
        if (redisTemplate.opsForList().size(historyKey) > MAX_HISTORY / 2) {
            String summary = generateSummary(chatHistory);
            redisTemplate.opsForValue().set(summaryKey, summary);
        }

        return response;
    }

    @Override
    public String generateSummary(List<String> chatHistory) {
        return "";
    }
}
