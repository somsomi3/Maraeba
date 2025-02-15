package com.be.domain.rooms.controller;

import com.be.db.entity.WebrtcMessage;
import com.be.db.repository.WebrtcMessageRepository;
import com.be.domain.rooms.request.WebrtcMessageRequest;
import com.be.common.model.response.BaseResponseBody;
import com.be.domain.rooms.service.WebrtcMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Slf4j
@RestController
//@RequestMapping
@RequiredArgsConstructor
public class WebrtcMessageController {

    private final WebrtcMessageRepository webrtcMessageRepository;
    private final WebrtcMessageService webrtcMessageService;

    // ✅ 메시지 저장
    @PostMapping("/webrtcs/messages")
    public ResponseEntity<? extends BaseResponseBody> saveMessage(@RequestBody WebrtcMessageRequest request,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        if (request == null) {
            return ResponseEntity.badRequest().body(BaseResponseBody.of("잘못된 요청: 요청 본문이 없음", 400));
        }

        log.info("Received WebSocket Message: {}", request);
        log.info("Received message_getuserid: {}", request.getUserId());
        log.info("Received message_getmessage: {}", request.getMessage());
        log.info("Received message_getsentat: {}", request.getSentAt());

        // 메시지 저장
        webrtcMessageService.saveMessage(request);
        return ResponseEntity.ok().body(BaseResponseBody.of("WebSocket 메시지 저장 성공", 200));
    }

    // ✅ 특정 방의 메시지 가져오기
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<?> getMessages(@PathVariable Long roomId,
                                         @RequestParam(required = false) Long userId) {
        log.info("📌 요청된 roomId: {}", roomId);
        List<WebrtcMessage> messages;

        if (userId != null) {
            // userId가 있으면 특정 유저의 메시지만 조회
            messages = webrtcMessageRepository.findByRoomIdAndUserId(roomId, userId);
        } else {
            // userId가 없으면 모든 메시지 조회
            messages = webrtcMessageRepository.findByRoomId(roomId);
        }

        return ResponseEntity.ok(messages);
    }
}
