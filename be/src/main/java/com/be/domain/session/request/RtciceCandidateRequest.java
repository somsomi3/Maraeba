package com.be.domain.session.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RtciceCandidateRequest {
    private Long sessionId; // WebRTC 연결을 위한 세션 ID
    private String candidate; // ICE Candidate 정보
}