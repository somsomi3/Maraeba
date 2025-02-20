package com.be.domain.rooms.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateRoomRequest {
    private String title;
    private String roomPassword;

    @JsonProperty("host_id") // JSON의 host_id를 Java의 hostId로 매핑
    private Long hostId;

}