package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserJoinRequest {
    private Long userId;
    private String roomPassword; // ✅ 방 비밀번호 필드 추가
}
