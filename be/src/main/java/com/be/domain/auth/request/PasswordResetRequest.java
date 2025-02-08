package com.be.domain.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequest {

	@NotBlank(message = "비밀번호 재설정 토큰은 필수입니다.")
	private String token;

	@NotBlank(message = "유저 아이디를 입력해주세요.")
	private String userId;

	@NotBlank(message = "새 비밀번호는 필수입니다.")
	@Size(min = 4, message = "비밀번호는 최소 4자 이상이어야 합니다.")
	private String newPassword;
}
