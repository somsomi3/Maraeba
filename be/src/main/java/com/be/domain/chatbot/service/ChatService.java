package com.be.domain.chatbot.service;

import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.ChatResponse;
import com.be.domain.chatbot.response.StartResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ChatService {
    StartResponse chatStart(Long userId, StartRequest request) throws JsonProcessingException;
    ChatResponse chat(String sessionId, MultipartFile audio) throws IOException;
    String response(String sessionId, String userMessage) throws JsonProcessingException;
    String generateSummary(List<String> chatHistory);
}
