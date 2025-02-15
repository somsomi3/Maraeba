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
    private String roomId; // ✅ 방 비밀번호 필드 추가

    public static UserJoinRequest of(Long userId, String roomId) {
        return new UserJoinRequest(userId, roomId);
    }
}
