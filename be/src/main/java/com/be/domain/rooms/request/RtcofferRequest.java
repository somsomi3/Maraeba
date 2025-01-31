package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RtcofferRequest {
    private Long roomId; // WebRTC 연결을 위한 세션 ID
    private String sdp; // WebRTC Offer SDP 정보
}