package com.be.domain.rooms.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ValidUserResponse extends BaseResponseBody {

	private String username;
	private Boolean isHost;

	private ValidUserResponse(String message, Integer status, String username, Boolean isHost) {
		super(message, status);
		this.username = username;
		this.isHost = isHost;
	}

	public static ValidUserResponse of(String username, Boolean isHost) {
		return new ValidUserResponse("유효합니다.", 200, username, isHost);
	}
}
