package com.be.domain.session.service;

import org.springframework.stereotype.Service;
//WebRTC 연결 및 시그널링 메시지 관리
@Service
public class WebrtcService {
    // 🔹 WebRTC Offer 처리
    public String sendOffer(Long sessionId, String sdp) {
        // Offer 저장 로직 추가
        return "Offer received for session " + sessionId;
    }

    // 🔹 WebRTC Answer 처리
    public String sendAnswer(Long sessionId, String sdp) {
        // Answer 저장 로직 추가
        return "Answer received for session " + sessionId;
    }

    // 🔹 ICE Candidate 저장
    public String sendIceCandidate(Long sessionId, String candidate) {
        // ICE Candidate 저장 로직 추가
        return "ICE Candidate received for session " + sessionId;
    }
}

