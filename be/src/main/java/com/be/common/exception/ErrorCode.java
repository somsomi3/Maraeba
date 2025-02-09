package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
	USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),
	CLASS_NOT_FOUND("Class Data Not Found", HttpStatus.NOT_FOUND),
	SESSION_NOT_FOUND("Session Not Found", HttpStatus.NOT_FOUND),
	STAT_NOT_FOUND("Stat Not Found", HttpStatus.NOT_FOUND),
	PASSWORD_MISMATCH("Password Mismatch", HttpStatus.BAD_REQUEST),
	SOCIAL_LOGIN_FAILED("Social Login Failed", HttpStatus.FORBIDDEN),
	KAKAO_USER_INFO_NOT_EXIST("Kakao User Info Not Exist", HttpStatus.FORBIDDEN),
	USER_ID_DUPLICATE("User ID Already Exists.", HttpStatus.CONFLICT),
	EMAIL_SEND_FAIL("Send Email Failed", HttpStatus.CONFLICT);

	private final String message;
	private final HttpStatus status;

	ErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}