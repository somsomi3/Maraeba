package com.be.domain.rooms.service;

import org.springframework.stereotype.Service;
//WebRTC 연결 및 시그널링 메시지 관리
@Service
public class WebrtcService {
    // 🔹 WebRTC Offer 처리
    public String sendOffer(Long roomId, String sdp) {
        // Offer 저장 로직 추가
        return "Offer received for session " + roomId;
    }

    // 🔹 WebRTC Answer 처리
    public String sendAnswer(Long roomId, String sdp) {
        // Answer 저장 로직 추가
        return "Answer received for room " + roomId;
    }

    // 🔹 ICE Candidate 저장
    public String sendIceCandidate(Long roomId, String candidate) {
        // ICE Candidate 저장 로직 추가
        return "ICE Candidate received for room " + roomId;
    }
}

