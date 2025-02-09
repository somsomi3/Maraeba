package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum TokenErrorCode {
	KAKAO_ACCESS_TOKEN_NOT_EXIST("카카오 액세스 토큰을 찾을 수 없음", HttpStatus.FORBIDDEN),
	ACCESS_TOKEN_BLACK("액세스 토큰이 블랙리스트에 있음", HttpStatus.FORBIDDEN),
	INVALID_REFRESH_TOKEN_ID("리프레시 토큰에서 ID 추출 에러", HttpStatus.BAD_REQUEST),
	PASSWORD_TOKEN_EXPIRED("비밀번호 재설정 토큰 만료", HttpStatus.GONE),
	PASSWORD_TOKEN_NOT_FOUND("존재하지 않는 비밀번호 재설정 토큰",HttpStatus.NOT_FOUND),
	REFRESH_TOKEN_EXPIRED("리프레시 토큰 만료", HttpStatus.GONE),
	REFRESH_TOKEN_MISMATCH("리프레시 토큰 불일치",HttpStatus.UNAUTHORIZED),
	REFRESH_TOKEN_NOT_FOUND("리프레시 토큰을 찾을 수 없음",HttpStatus.NOT_FOUND);


	private final String message;
	private final HttpStatus status;

	TokenErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}