package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
	@Schema(description = "사용자 ID", example = "testUser123", name = "user_id")
	@NotBlank(message = "User ID is required.")
	private String userId;

	@Schema(description = "비밀번호 (최소 4자리)", example = "password123")
	@NotBlank(message = "Password is required.")
	@Size(min = 4, message = "Password must be at least 4 characters.")
	private String password;

	@Schema(description = "이메일 주소", example = "test@example.com")
	@NotBlank(message = "Email is required.")
	@Email(message = "Invalid email format")
	private String email;

	@Schema(description = "사용자 이름", example = "John Doe")
	@NotBlank(message = "Username is required.")
	private String username;
}
