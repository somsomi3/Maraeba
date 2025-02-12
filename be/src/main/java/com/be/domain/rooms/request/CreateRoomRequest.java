package com.be.domain.rooms.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CreateRoomRequest {
//    private Long Id;//만들어진 방고유번호
//    private Long userId;
    private String title;
    private String roomPassword;
    private LocalDateTime StartedAt;

    @JsonProperty("host_id") // JSON의 host_id를 Java의 hostId로 매핑
    private Long hostId;

}