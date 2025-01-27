package com.be.domain.users.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordRequest {
	@NotNull(message = "Password cannot be null")
	@Size(min = 4, message = "Password must be at least 4 characters long")
	private String password;
}
