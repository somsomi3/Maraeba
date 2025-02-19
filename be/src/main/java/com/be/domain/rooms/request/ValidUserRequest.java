package com.be.domain.rooms.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ValidUserRequest {
	private Long userId;
	private Long roomId;

	public static ValidUserRequest of(Long userId, Long roomId) {
		return new ValidUserRequest(userId, roomId);
	}
}
