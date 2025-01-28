package com.be.domain.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
	@NotBlank(message = "User ID is required.")
	private String userId;

	@NotBlank(message = "Password is required.")
	private String password;
}
