package com.be.common.model.response;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

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

	public BaseResponseBody(HttpStatus statusCode) {
		this.statusCode = statusCode.value();
	}

	public BaseResponseBody(String message, HttpStatus statusCode) {
		this.message = message;
		this.statusCode = statusCode.value();
	}

	//정적 팩토리 메서드, 주어진 값으로 객체를 반환
	public static BaseResponseBody of(String message, HttpStatus statusCode) {
		BaseResponseBody responseBody = new BaseResponseBody();
		responseBody.message = message;
		responseBody.statusCode = statusCode.value();
		return responseBody;
	}
}
