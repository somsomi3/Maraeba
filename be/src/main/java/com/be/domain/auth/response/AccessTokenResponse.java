package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AccessTokenResponse extends BaseResponseBody {
	@Schema(description = "발급된 액세스 토큰 (JWT)", example = "eyJhbGciOiJIUzI1NiIsInR...", name = "access_token")
	private String accessToken;

	private AccessTokenResponse(String message, Integer statusCode, String accessToken) {
		super(message, statusCode);
		this.accessToken = accessToken;
	}

	public static AccessTokenResponse from(LoginResponse response) {
		return new AccessTokenResponse(response.getMessage(), response.getStatusCode(), response.getAccessToken());
	}
	public static AccessTokenResponse from(TokenRefreshResponse response) {
		return new AccessTokenResponse(response.getMessage(), response.getStatusCode(), response.getAccessToken());
	}
}
