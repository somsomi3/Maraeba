package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckEmailResponse extends BaseResponseBody {
	@Schema(description = "확인할 이메일", example = "user@example.com")
	private String email;
	@Schema(description = "이메일 중복 여부 (true: 중복, false: 사용 가능)", example = "false", name = "is_duplicate")
	private boolean isDuplicate;

	private CheckEmailResponse(String message, Integer status, String email, boolean isDuplicate) {
		super(message, status);
		this.email = email;
		this.isDuplicate = isDuplicate;
	}

	public static CheckEmailResponse of(String message, Integer status, String email, boolean isDuplicate) {
		return new CheckEmailResponse(message, status, email, isDuplicate);
	}
}
