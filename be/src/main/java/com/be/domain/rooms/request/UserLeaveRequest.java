package com.be.domain.rooms.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserLeaveRequest {
    private Long userId;
    private String roomId;

    public static UserLeaveRequest of(Long userId, String roomId) {
        return new UserLeaveRequest(userId, roomId);
    }
}
