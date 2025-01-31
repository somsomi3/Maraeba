package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WebrtcMessage {
    private String type; // "offer", "answer", "candidate"
    private String sender; // 보낸 사람
    private String target; // 받을 사람
    private String sdp; // SDP 정보 (Offer/Answer)
    private String candidate; // ICE Candidate 정보
}
