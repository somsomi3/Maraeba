package com.be.domain.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshRequest {

	@NotBlank(message = "Refresh Token is required.")
	private String refreshToken;
}
