package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoomRequest {
    private String title;
    private String roomPassword;
    private Long hostId;
}