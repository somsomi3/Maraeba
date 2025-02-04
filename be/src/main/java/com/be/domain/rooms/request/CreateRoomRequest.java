package com.be.domain.rooms.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoomRequest {
    private String title;
    @JsonProperty("room_password") // JSON의 room_password를 Java의 roomPassword로 매핑
    private String roomPassword;
    @JsonProperty("host_id") // JSON의 host_id를 Java의 hostId로 매핑
    private Long hostId;
}