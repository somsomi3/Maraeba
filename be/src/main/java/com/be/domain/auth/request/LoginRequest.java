package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
	@Schema(description = "사용자 아이디", example = "test_user", name = "user_id")
	@NotBlank(message = "User ID is required.")
	private String userId;

	@Schema(description = "사용자 비밀번호", example = "securepassword123")
	@NotBlank(message = "Password is required.")
	private String password;
}
