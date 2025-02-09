package com.be.domain.chatbot.controller;

import com.be.domain.chatbot.service.ChatService;
import com.be.domain.chatbot.service.OpenAiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatBotController {

    private final ChatService chatService;

    @PostMapping
    public String chat(@RequestBody Map<String, String> request) throws JsonProcessingException {
        String userMessage = request.get("message");
        return chatService.chat("1234", userMessage);
    }
}
