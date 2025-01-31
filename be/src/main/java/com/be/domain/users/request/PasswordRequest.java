package com.be.domain.users.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordRequest {
	@Schema(description = "사용자 비밀번호", example = "securePassword123")
	@NotBlank(message = "Password cannot be empty")
	@Size(min = 4, message = "Password must be at least 4 characters long")
	private String password;
}
