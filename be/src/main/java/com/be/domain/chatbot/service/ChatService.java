package com.be.domain.chatbot.service;

import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

public interface ChatService {
    String chat(String sessionId, String userMessage) throws JsonProcessingException;
    String generateSummary(List<String> chatHistory);
}
