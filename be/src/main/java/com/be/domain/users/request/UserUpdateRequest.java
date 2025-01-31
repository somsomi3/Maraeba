package com.be.domain.users.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
	@Schema(description = "사용자 이메일 (선택 사항, 변경할 경우 입력)", example = "user@example.com")
	@Email(message = "Invalid email format")
	@NotBlank(message = "Email cannot be empty")
	private String email;

	@Schema(description = "사용자 이름 (필수)", example = "JohnDoe")
	@NotBlank(message = "Username cannot be empty")
	@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
	private String username;
}
