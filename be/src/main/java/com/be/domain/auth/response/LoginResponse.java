package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginResponse extends BaseResponseBody {
	private String accessToken;
	private String refreshToken;

	private LoginResponse(String message, Integer status, String accessToken, String refreshToken) {
		super(message, status);
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static LoginResponse of( String accessToken, String refreshToken) {
		return new LoginResponse("User Login successfully", 200, accessToken, refreshToken);
	}
}
