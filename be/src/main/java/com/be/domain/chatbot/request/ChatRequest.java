package com.be.domain.chatbot.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ChatRequest {
    private MultipartFile audio;
    private String sessionId;
}
