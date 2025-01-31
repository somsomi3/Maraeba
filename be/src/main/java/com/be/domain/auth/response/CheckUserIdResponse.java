package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckUserIdResponse extends BaseResponseBody {
	@Schema(description = "확인할 사용자 ID", example = "test_user", name = "user_id")
	private String userId;
	@Schema(description = "사용자 ID 중복 여부 (true: 중복, false: 사용 가능)", example = "false", name = "is_duplicate")
	private boolean isDuplicate;

	private CheckUserIdResponse(String message, Integer status ,String userId, boolean isDuplicate) {
		super(message, status);
		this.userId = userId;
		this.isDuplicate = isDuplicate;
	}

	public static CheckUserIdResponse of(String message, Integer status ,String userId, boolean isDuplicate) {
		return new CheckUserIdResponse(message, status, userId, isDuplicate);
	}
}
