package com.be.domain.chatbot.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class PromptDTO {
    private String sessionId;
    private String aiRole;
    private String userRole;
    private String situation;
}
