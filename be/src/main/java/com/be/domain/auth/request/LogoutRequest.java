package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutRequest {
	@Schema(description = "로그아웃을 위한 Refresh Token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", name = "refresh_token")
	@NotBlank(message = "Refresh Token is required.")
	private String refreshToken;
}
