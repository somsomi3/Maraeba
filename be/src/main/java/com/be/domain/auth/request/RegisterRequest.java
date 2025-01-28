package com.be.domain.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
	@NotBlank(message = "User ID is required.")
	private String userId;

	@NotBlank(message = "User ID is required.")
	@Size(min = 4, message = "Password must be at least 4 characters.")
	private String password;

	@NotBlank(message = "User ID is required.")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "User ID is required.")
	private String username;
}
