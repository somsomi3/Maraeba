package com.be.domain.users.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordUpdateRequest {
	@NotNull(message = "Current password cannot be null")
	private String currentPassword;

	@NotNull(message = "New password cannot be null")
	@Size(min = 4, message = "New password must be at least 4 characters long")
	private String newPassword;
}
