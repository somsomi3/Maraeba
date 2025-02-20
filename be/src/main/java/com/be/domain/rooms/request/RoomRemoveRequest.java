package com.be.domain.rooms.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomRemoveRequest {
    private String roomId; // 방 비밀번호 필드 추가

    public static RoomRemoveRequest of(String roomId) {
        return new RoomRemoveRequest(roomId);
    }
}
