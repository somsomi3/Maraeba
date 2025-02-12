package com.be.domain.chatbot.controller;

import com.be.domain.chatbot.request.ChatRequest;
import com.be.domain.chatbot.request.StartRequest;
import com.be.domain.chatbot.response.ChatResponse;
import com.be.domain.chatbot.response.StartResponse;
import com.be.domain.chatbot.service.ChatService;
import com.be.domain.chatbot.service.OpenAiService;
import com.be.domain.wgames.common.service.SpeechService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatBotController {

    private final ChatService chatService;

    @PostMapping
    public String chat1(@RequestBody Map<String, String> request) throws JsonProcessingException {
        String userMessage = request.get("message");
        String sessionId = request.get("session_id");
        return chatService.response(sessionId, userMessage);
    }

    @PostMapping("/start")
    public ResponseEntity<StartResponse> start(@AuthenticationPrincipal UserDetails user, @RequestBody StartRequest request) throws JsonProcessingException {
        System.out.println(request.getAiRole());
        System.out.println(request.getUserRole());
        System.out.println(request.getSituation());
        return ResponseEntity.ok(chatService.chatStart(Long.valueOf(user.getUsername()), request));
    }

    @PostMapping("/play")
    public ResponseEntity<ChatResponse> chat(@ModelAttribute ChatRequest request) throws IOException {
        return ResponseEntity.ok(chatService.chat(request.getSessionId(), request.getAudio()));
    }
//    @PostMapping("/exit")
}
