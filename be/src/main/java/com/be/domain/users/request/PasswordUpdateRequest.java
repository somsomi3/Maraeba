package com.be.domain.users.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordUpdateRequest {
	@Schema(description = "현재 비밀번호", example = "oldPassword123", name = "current_password")
	@NotBlank(message = "Current password cannot be empty")
	private String currentPassword;

	@Schema(description = "새로운 비밀번호", example = "newSecurePassword123", name = "new_password")
	@NotBlank(message = "New password cannot be empty")
	@Size(min = 4, message = "New password must be at least 4 characters long")
	private String newPassword;
}
