package com.be.domain.rooms.service;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.WebRTCMessage;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.UserRepository;
import com.be.db.repository.WebRTCMessageRepository;
import com.be.domain.rooms.request.WebRTCMessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WebRTCMessageService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final WebRTCMessageRepository webRTCMessageRepository;

    // 채팅 메시지 저장
    public void saveMessage(WebRTCMessageRequest request) {

        if (request.getUserId() == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        // sentAt 값이 없으면 기본값으로 현재 시간 설정
        String sentAt = String.valueOf(request.getSentAt());
        if (sentAt == null) {
            sentAt = LocalDateTime.now().toString();  // 기본값 설정
        }

        // 날짜 값을 LocalDateTime으로 변환
        LocalDateTime sentAtDateTime = LocalDateTime.parse(sentAt);
        WebRTCMessage webrtcMessage = new WebRTCMessage();

        webrtcMessage.setUser(userRepository.findById(request.getUserId()).orElseThrow(()->new CustomException(ErrorCode.USER_NOT_FOUND)));
        webrtcMessage.setMessage(request.getMessage());
        webrtcMessage.setRoom(roomRepository.findById(request.getRoomId()).orElseThrow(()->new CustomException(ErrorCode.ROOM_NOT_FOUND)));
        webrtcMessage.setSentAt(sentAtDateTime);  // sentAt 설정

        // DB에 저장
        webRTCMessageRepository.save(webrtcMessage);
    }
}
