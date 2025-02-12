package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserLeaveRequest {
    private Long user;
    private String room;
}
