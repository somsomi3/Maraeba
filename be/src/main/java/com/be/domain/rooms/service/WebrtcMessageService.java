package com.be.domain.rooms.service;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.User;
import com.be.db.entity.WebrtcMessage;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.UserRepository;
import com.be.db.repository.WebrtcMessageRepository;
import com.be.domain.rooms.request.WebrtcMessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class WebrtcMessageService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final WebrtcMessageRepository webrtcMessageRepository;

    // 채팅 메시지 저장
    public void saveMessage(WebrtcMessageRequest request) {
//        // Room과 User 객체를 받아오기
//        Room room = roomRepository.findById(roomId).orElseThrow(()->new CustomException(ErrorCode.ROOM_NOT_FOUND));
//        User sender = userRepository.findById(userId).orElseThrow(()->new CustomException(ErrorCode.USER_NOT_FOUND));
//        User senderId = (User) websocketMessageRepository.findBySenderId(request.getSenderId());

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
//        User sender = userRepository.findById(request.getSenderId()).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        // WebsocketMessage 객체 생성
        WebrtcMessage webrtcMessage = new WebrtcMessage();
        webrtcMessage.setUser(userRepository.findById(request.getUserId()).orElseThrow(()->new CustomException(ErrorCode.USER_NOT_FOUND)));
        webrtcMessage.setMessage(request.getMessage());
        webrtcMessage.setRoom(roomRepository.findById(request.getRoomId()).orElseThrow(()->new CustomException(ErrorCode.ROOM_NOT_FOUND)));
//        webrtcMessage.setSender(sender);  // 메시지를 보낸 사용자 설정
        webrtcMessage.setSentAt(sentAtDateTime);  // sentAt 설정
        // DB에 저장
        webrtcMessageRepository.save(webrtcMessage);
    }
}
