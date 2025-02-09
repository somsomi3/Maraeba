package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum AuthErrorCode {
	USER_ID_DUPLICATE("User ID Already Exists.", HttpStatus.CONFLICT),
	INVALID_USER_ID("User ID Not Valid.", HttpStatus.BAD_REQUEST),
	WEAK_PASSWORD("Weak Password Not Valid.", HttpStatus.BAD_REQUEST),
	INVALID_EMAIL("Email Not Valid.", HttpStatus.BAD_REQUEST),
	USER_NOT_FOUND("User Not Found.", HttpStatus.NOT_FOUND),
	PASSWORD_MISMATCH("Incorrect Password.", HttpStatus.UNAUTHORIZED),
	LOGIN_FAILED("Login Failed Due To Invalid Credentials.", HttpStatus.UNAUTHORIZED);

	private final String message;
	private final HttpStatus status;

	AuthErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}