package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckUserIdResponse extends BaseResponseBody {
	private String userId;
	private boolean isDuplicate;

	private CheckUserIdResponse(String message, Integer status ,String userId, boolean isDuplicate) {
		super(message, status);
		this.userId = userId;
		this.isDuplicate = isDuplicate;
	}

	public CheckUserIdResponse of(String message, Integer status ,String userId, boolean isDuplicate) {
		return new CheckUserIdResponse(message, status, userId, isDuplicate);
	}
}
