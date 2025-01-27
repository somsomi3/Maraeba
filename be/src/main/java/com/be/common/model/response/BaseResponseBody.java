package com.be.common.model.response;

import lombok.Getter;
import lombok.Setter;

/**
 * 서버 요청에 대한 기본 응답값(바디) 정의
 */
@Getter
@Setter
public class BaseResponseBody {
	private String message = null;
	private Integer statusCode = null;

	public BaseResponseBody() {
	}

	public BaseResponseBody(Integer statusCode) {
		this.statusCode = statusCode;
	}

	public BaseResponseBody(String message, Integer statusCode) {
		this.message = message;
		this.statusCode = statusCode;
	}

	//정적 팩토리 메서드, 주어진 값으로 객체를 반환
	public static BaseResponseBody of(String message, Integer statusCode) {
		BaseResponseBody responseBody = new BaseResponseBody();
		responseBody.message = message;
		responseBody.statusCode = statusCode;
		return responseBody;
	}
}
