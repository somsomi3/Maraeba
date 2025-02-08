package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

	@Schema(description = "사용자의 아이디", example = "test_user")
	@NotBlank(message = "아이디는 필수 입력값입니다.")
	private String userId;

	@Email(message = "올바른 이메일 주소 형식이 아닙니다.")
	@NotBlank(message = "이메일은 필수 입력값입니다.")
	@Schema(description = "사용자의 이메일", example = "user@example.com")
	private String email;
}