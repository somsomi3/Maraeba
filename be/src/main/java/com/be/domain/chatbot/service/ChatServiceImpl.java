package com.be.domain.chatbot.service;

import com.be.db.entity.AISession;
import com.be.db.repository.AISessionRepository;
import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.StartResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService{

    AISessionRepository aiSessionRepository;

    private final RedisTemplate<String, String> redisTemplate;
    private final OpenAiClient openAiClient;

    private static final int MAX_HISTORY = 10; // 최근 10개 대화만 유지

    @Override
    public StartResponse chatStart(Integer user_id, StartRequest request) throws JsonProcessingException {
        //UUID로 세션 ID 생성
        String sessionId = String.valueOf(UUID.randomUUID());

        //aiSession Entity 객체 생성 후 DB에 저장
        AISession aiSession = AISession.builder()
                .id(user_id)
                .sessionId(sessionId)
                .build();
        aiSessionRepository.save(aiSession);

        //입력된 역할과 설정으로 프롬포트 생성 후 대화 AI에 전송, 응답 받음
        String message = "너는 주어진 역할과 상황에 따라 초등학교 저학년까지의 아동과 대화하는 AI ChatBot 이고, 대화를 먼저 시작하는 건 너야. 지금부터 네 역할은 "
                + request.getAiRole() + "이고, 상대방의 역할은 " + request.getUserRole() + "이야. 그리고 주어진 상황은"
                + request.getSituation() + "이야. 알아들었다면 대화를 바로 시작할거야. 상대방에게 말할 적절한 너의 첫 마디를 말해줘.";
        String answer = chat(sessionId, message);

        //클라이언트로 전송할 응답 객체 생성
        return StartResponse.builder()
                .answer(answer)
                .sessionId(sessionId)
                .build();
    }

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
