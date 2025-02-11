package com.be.domain.chatbot.service;

import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.StartResponse;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

public interface ChatService {
    StartResponse chatStart(Integer user_id, StartRequest request) throws JsonProcessingException;
    String chat(String sessionId, String userMessage) throws JsonProcessingException;
    String generateSummary(List<String> chatHistory);
}
