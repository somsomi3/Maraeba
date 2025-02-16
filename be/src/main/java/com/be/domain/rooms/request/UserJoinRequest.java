package com.be.domain.rooms.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserJoinRequest {
    private Long userId;
    private Long roomId;
    private String roomPassword;

    public static UserJoinRequest of(Long userId, Long roomId, String roomPassword) {
        return new UserJoinRequest(userId, roomId, roomPassword);
    }
}
