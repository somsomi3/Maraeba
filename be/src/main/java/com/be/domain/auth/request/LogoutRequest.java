package com.be.domain.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutRequest {
	@NotBlank(message = "Refresh Token is required.")
	private String refreshToken;
}
