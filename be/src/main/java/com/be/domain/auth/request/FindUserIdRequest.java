package com.be.domain.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindUserIdRequest {
	@Schema(description = "아이디 찾기를 위한 이메일", example = "user@example.com")
	@NotBlank(message = "Email is required.")
	private String email;
}
