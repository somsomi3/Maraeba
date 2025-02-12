package com.be.domain.rooms.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserJoinRequest {
    private Long user;
    private String room; // ✅ 방 비밀번호 필드 추가
}
