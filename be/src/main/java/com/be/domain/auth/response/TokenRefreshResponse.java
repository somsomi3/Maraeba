package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TokenRefreshResponse extends BaseResponseBody {
	@Schema(description = "새롭게 발급된 액세스 토큰 (JWT)", example = "eyJhbGciOiJIUzI1NiIsInR...", name = "access_token")
	private String accessToken;
	@Schema(description = "새롭게 발급된 리프레시 토큰 (JWT)", example = "eyJhbGciOiJIUzI1NiIsInR...", name = "refresh_token")
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
