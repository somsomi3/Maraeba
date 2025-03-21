package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
	USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),
	CLASS_NOT_FOUND("Class Data Not Found", HttpStatus.NOT_FOUND),
	SESSION_NOT_FOUND("Session Not Found", HttpStatus.NOT_FOUND),
	STAT_NOT_FOUND("Stat Not Found", HttpStatus.NOT_FOUND),

	ROOM_NOT_FOUND("Room Not Found", HttpStatus.NOT_FOUND),

	PASSWORD_MISMATCH("Password Mismatch", HttpStatus.BAD_REQUEST),
	SOCIAL_LOGIN_FAILED("Social Login Failed", HttpStatus.FORBIDDEN),
	EMAIL_SEND_FAIL("Send Email Failed", HttpStatus.CONFLICT),
	DATABASE_ERROR("Database Error", HttpStatus.INTERNAL_SERVER_ERROR),
	ROOM_PASSWORD_INCORRECT("Room Password Incorrect", HttpStatus.BAD_REQUEST),
	ROOM_USER_DUPLICATED("Duplicate Room User", HttpStatus.CONFLICT),
	ROOM_USER_NOT_FOUND("Room User Not Found", HttpStatus.NOT_FOUND),
	ROOM_IS_NOT_ACTIVE("Room is not active", HttpStatus.BAD_REQUEST),
	ROOM_IS_FULL("Room is full",HttpStatus .CONFLICT);


	private final String message;
	private final HttpStatus status;

	ErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}