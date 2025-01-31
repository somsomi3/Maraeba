package com.be.common.model.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 서버 요청에 대한 기본 응답값(바디) 정의
 */
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BaseResponseBody {
	@Schema(description = "응답 메시지", example = "메시지")
	private String message;
	@Schema(description = "HTTP 응답 코드", example = "Integer")
	private Integer statusCode;

	//정적 팩토리 메서드, 주어진 값으로 객체를 반환
	public static BaseResponseBody of(String message, Integer statusCode) {
		return new BaseResponseBody(message, statusCode);
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
