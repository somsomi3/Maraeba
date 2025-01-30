package com.be.common.model.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
	private Integer status;

	//정적 팩토리 메서드, 주어진 값으로 객체를 반환
	public static BaseResponseBody of(String message, Integer status) {
		return new BaseResponseBody(message, status);
	}
}
