package com.be.domain.rooms.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GameStartResponse {
	private Long roomId;
	private boolean isHost;  // 방장 여부 추가
}
