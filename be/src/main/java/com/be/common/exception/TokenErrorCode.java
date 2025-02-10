package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum TokenErrorCode {

	ACCESS_TOKEN_NOT_EXIST("Bearer 액세스 토큰을 찾을 수 없음", HttpStatus.UNAUTHORIZED),
	ACCESS_TOKEN_EXPIRED("액세스 토큰 만료", HttpStatus.UNAUTHORIZED),
	ACCESS_TOKEN_NOT_PROVIDED("Access Token is missing.", HttpStatus.BAD_REQUEST),
	ACCESS_TOKEN_BLACK("액세스 토큰이 블랙리스트에 있음", HttpStatus.FORBIDDEN),

	PASSWORD_TOKEN_EXPIRED("비밀번호 재설정 토큰 만료", HttpStatus.GONE),
	PASSWORD_TOKEN_NOT_FOUND("존재하지 않는 비밀번호 재설정 토큰",HttpStatus.NOT_FOUND),


	REFRESH_TOKEN_EXPIRED("리프레시 토큰 만료", HttpStatus.GONE),
	REFRESH_TOKEN_MISMATCH("리프레시 토큰 불일치",HttpStatus.UNAUTHORIZED),
	REFRESH_TOKEN_NOT_FOUND("리프레시 토큰을 찾을 수 없음",HttpStatus.NOT_FOUND),
	REFRESH_TOKEN_NOT_EXIST("리프레시 토큰이 쿠키에 없음",HttpStatus.BAD_REQUEST),
	REFRESH_TOKEN_NOT_PROVIDED("Refresh Token is missing.", HttpStatus.BAD_REQUEST),

	INVALID_ACCESS_TOKEN("액세스 토큰이 유효하지 않음",HttpStatus.UNAUTHORIZED),
	INVALID_REFRESH_TOKEN_ID("리프레시 토큰에서 ID 추출 에러", HttpStatus.BAD_REQUEST),

	COOKIE_CREATION_FAILED("Failed to create cookie.", HttpStatus.INTERNAL_SERVER_ERROR),
	BLACKLIST_SAVE_FAILED("Failed to add Access Token to blacklist.", HttpStatus.INTERNAL_SERVER_ERROR),

	TOKEN_GENERATION_FAILED("Token Generation Failed.", HttpStatus.INTERNAL_SERVER_ERROR),

	KAKAO_ACCESS_TOKEN_NOT_EXIST("카카오 액세스 토큰을 찾을 수 없음", HttpStatus.FORBIDDEN),
	KAKAO_AUTH_CODE_NOT_EXIST("Authorization Code is missing.", HttpStatus.BAD_REQUEST),
	KAKAO_ACCESS_TOKEN_REQUEST_FAILED("Failed to retrieve Access Token from Kakao.", HttpStatus.UNAUTHORIZED),
	KAKAO_ACCESS_TOKEN_NOT_PROVIDED("Access Token is missing.", HttpStatus.BAD_REQUEST),
	KAKAO_USER_INFO_NOT_EXIST("User Info not received from Kakao.", HttpStatus.UNAUTHORIZED),
	KAKAO_USER_INFO_INCOMPLETE("Essential user info is missing.", HttpStatus.UNAUTHORIZED),
	KAKAO_USER_INFO_REQUEST_FAILED("Failed to retrieve user info from Kakao.", HttpStatus.UNAUTHORIZED),

	NAVER_ACCESS_TOKEN_NOT_EXIST("카카오 액세스 토큰을 찾을 수 없음", HttpStatus.FORBIDDEN),
	NAVER_AUTH_CODE_NOT_EXIST("Authorization Code is missing.", HttpStatus.BAD_REQUEST),
	NAVER_ACCESS_TOKEN_REQUEST_FAILED("Failed to retrieve Access Token from Kakao.", HttpStatus.UNAUTHORIZED),
	NAVER_ACCESS_TOKEN_NOT_PROVIDED("Access Token is missing.", HttpStatus.BAD_REQUEST),
	NAVER_USER_INFO_NOT_EXIST("User Info not received from Kakao.", HttpStatus.UNAUTHORIZED),
	NAVER_USER_INFO_INCOMPLETE("Essential user info is missing.", HttpStatus.UNAUTHORIZED),
	NAVER_USER_INFO_REQUEST_FAILED("Failed to retrieve user info from Kakao.", HttpStatus.UNAUTHORIZED);

	private final String message;
	private final HttpStatus status;

	TokenErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}