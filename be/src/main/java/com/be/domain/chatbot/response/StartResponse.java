package com.be.domain.chatbot.response;

import lombok.Builder;

@Builder
public class StartResponse {
    String sessionId;
    String answer;
}
