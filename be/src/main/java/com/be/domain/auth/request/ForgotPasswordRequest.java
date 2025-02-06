package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

	@Schema(description = "사용자의 아이디", example = "test_user")
	private String userId;

	@Schema(description = "사용자의 이메일", example = "user@example.com")
	private String email;
}