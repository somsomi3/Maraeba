package com.be.common.exception;

public class PasswordTokenNotFoundException extends RuntimeException {
	public PasswordTokenNotFoundException() {
		super("유효하지 않은 토큰입니다.");
	}
	public PasswordTokenNotFoundException(String message) {
		super(message);
	}
}
