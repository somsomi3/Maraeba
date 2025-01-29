package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckEmailResponse extends BaseResponseBody {
	private String email;
	private boolean isDuplicate;

	private CheckEmailResponse(String message, Integer status, String email, boolean isDuplicate) {
		super(message, status);
		this.email = email;
		this.isDuplicate = isDuplicate;
	}

	public CheckEmailResponse of(String message, Integer status, String email, boolean isDuplicate) {
		return new CheckEmailResponse(message, status, email, isDuplicate);
	}
}
