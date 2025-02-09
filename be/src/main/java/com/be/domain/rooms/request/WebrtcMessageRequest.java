package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class WebrtcMessageRequest {
    private Long userId;
    private Long roomId;
    private LocalDateTime sentAt;
    public String Message;
    private String type; // "offer", "answer", "candidate"
//    private Long senderId; // 보낸 사람
}
