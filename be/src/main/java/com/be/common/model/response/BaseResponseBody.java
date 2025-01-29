package com.be.common.model.response;

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
	private String message;
	private Integer status;

	//정적 팩토리 메서드, 주어진 값으로 객체를 반환
	public static BaseResponseBody of(String message, Integer status) {
		return new BaseResponseBody(message, status);
	}
}
