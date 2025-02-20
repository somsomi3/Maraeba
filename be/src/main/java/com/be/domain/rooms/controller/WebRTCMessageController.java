package com.be.domain.rooms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.rooms.request.WebRTCMessageRequest;
import com.be.domain.rooms.service.WebRTCMessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebRTCMessageController {

    private final WebRTCMessageService webRTCMessageService;

    // ✅ 메시지 저장
    @PostMapping("/webrtcs/message")
    public ResponseEntity<? extends BaseResponseBody> saveMessage(@RequestBody WebRTCMessageRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        if (request == null) {
            return ResponseEntity.badRequest().body(BaseResponseBody.of("잘못된 요청: 요청 본문이 없음", 400));
        }

        log.info("Received WebSocket Message: {}", request);
        log.info("Received message_getuserid: {}", request.getUserId());
        log.info("Received message_getmessage: {}", request.getMessage());
        log.info("Received message_getsentat: {}", request.getSentAt());

        // 메시지 저장
        webRTCMessageService.saveMessage(request);
        return ResponseEntity.ok().body(BaseResponseBody.of("WebSocket 메시지 저장 성공", 200));
    }

}
