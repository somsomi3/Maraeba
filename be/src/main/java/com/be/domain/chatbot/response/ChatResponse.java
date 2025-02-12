package com.be.domain.chatbot.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatResponse {
    private String answer;
}
