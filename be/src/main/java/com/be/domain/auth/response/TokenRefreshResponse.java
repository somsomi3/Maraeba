package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TokenRefreshResponse extends BaseResponseBody {
	private String accessToken;
	private String refreshToken;

	private TokenRefreshResponse(String message, Integer status, String accessToken, String refreshToken) {
		super(message, status);
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static TokenRefreshResponse of(String accessToken, String refreshToken) {
		return new TokenRefreshResponse("Token generated successfully", 201, accessToken, refreshToken);
	}
}
