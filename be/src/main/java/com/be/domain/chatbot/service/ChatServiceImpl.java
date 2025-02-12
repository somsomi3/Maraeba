package com.be.domain.chatbot.service;

import com.be.db.entity.AIChatPrompt;
import com.be.db.entity.AISession;
import com.be.db.entity.User;
import com.be.db.repository.AIPromptRepository;
import com.be.db.repository.AISessionRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.chatbot.dto.PromptDTO;
import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.ChatResponse;
import com.be.domain.chatbot.response.StartResponse;
import com.be.domain.wgames.common.service.SpeechService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService{

    private final AISessionRepository aiSessionRepository;
    private final AIPromptRepository aiPromptRepository;
    private final UserRepository userRepository;
    private final SpeechService speechService;

    private final RedisTemplate<String, String> redisTemplate;
    private final OpenAiClient openAiClient;

    private static final int MAX_HISTORY = 10; // 최근 10개 대화만 유지

    //대화 처음 시작 시 세션ID 설정하고 테이블에 세션 저장
    @Override
    @Transactional
    public String saveSession(Long userId) {
        //UUID로 세션 ID 생성
        String sessionId = String.valueOf(UUID.randomUUID());
        User user = userRepository.getReferenceById(userId);

        AISession aiSession = AISession.builder()
                .user(user)
                .sessionId(sessionId)
                .build();

        aiSessionRepository.save(aiSession);
        return sessionId;
    }

    //대화 처음 시작 시 프롬포트 설정
    @Override
    public PromptDTO settingPrompt(String sessionId, StartRequest request) {
        if(request.isDefault()) {
            AIChatPrompt prompt = aiPromptRepository.getReferenceById(request.getDefaultId());
            return PromptDTO.builder()
                    .sessionId(sessionId)
                    .aiRole(prompt.getAiPositon())
                    .userRole(prompt.getUserPostion())
                    .situation(prompt.getSituation())
                    .build();
        } else {
            return PromptDTO.builder()
                    .sessionId(sessionId)
                    .aiRole(request.getAiRole())
                    .userRole(request.getUserRole())
                    .situation(request.getSituation())
                    .build();
        }
    }

    //대화 시작 시 처음 상황 입력
    @Override
    public StartResponse chatStart(String sessionId, PromptDTO prompt) throws JsonProcessingException {
        //입력된 역할과 설정으로 프롬포트 생성 후 대화 AI에 전송, 응답 받음
        String message = "너는 주어진 역할과 상황에 따라 초등학교 저학년까지의 아동과 대화하는 AI ChatBot 이고, 대화를 먼저 시작하는 건 너야. 지금부터 네 역할은 "
                + prompt.getAiRole() + "이고, 상대방의 역할은 " + prompt.getUserRole() + "이야. 그리고 주어진 상황은"
                + prompt.getSituation() + "이야. 알아들었다면 대화를 바로 시작할거야. 상대방에게 말할 적절한 너의 첫 마디를 말해줘.";
        String answer = response(sessionId, message);
        //클라이언트로 전송할 응답 객체 생성
        return StartResponse.builder()
                .answer(answer)
                .sessionId(sessionId)
                .build();
    }

    //
    @Override
    public ChatResponse chat(String sessionId, MultipartFile audio) throws IOException {
        String message = speechService.SpeechToText(audio);
        System.out.println(message);
        String answer = response(sessionId, message);
        System.out.println(answer);
        return ChatResponse.builder()
                .answer(answer)
                .build();
    }

    //GPT 답장
    @Override
    @Transactional
    public String response(String sessionId, String userMessage) throws JsonProcessingException {
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

    @Override
    @Transactional
    public boolean deleteSession(String sessionId) {
        redisTemplate.delete(sessionId);
        aiSessionRepository.deleteBySessionId(sessionId);
        return false;
    }
}
