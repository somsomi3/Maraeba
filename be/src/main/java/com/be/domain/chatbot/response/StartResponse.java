package com.be.domain.chatbot.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StartResponse {
    private String sessionId;
    private String answer;
}
