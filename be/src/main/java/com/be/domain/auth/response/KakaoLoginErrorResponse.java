package com.be.domain.auth.response;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoLoginErrorResponse extends BaseResponseBody {
	private String error;

	private KakaoLoginErrorResponse(String message, Integer status, String error) {
		super(message, status);
		this.error = error;
	}

	public static KakaoLoginErrorResponse of(String message, String error) {
		return new KakaoLoginErrorResponse(message, HttpStatus.BAD_REQUEST.value(), error);
	}
}
