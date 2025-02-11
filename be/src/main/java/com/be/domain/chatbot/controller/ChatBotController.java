package com.be.domain.chatbot.controller;

import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.StartResponse;
import com.be.domain.chatbot.service.ChatService;
import com.be.domain.chatbot.service.OpenAiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        String sessionId = request.get("session_id");
        return chatService.chat(sessionId, userMessage);
    }
//    @AuthenticationPrincipal UserDetails user,
    @PostMapping("/start")
    public StartResponse start(@AuthenticationPrincipal UserDetails user, @RequestBody StartRequest request) {
        return chatService.chatStart(user.getUsername(), request);
    }

//    @PostMapping("/play")
//
//    @PostMapping("/exit")
}
