package com.be.common.exception;

public class PasswordTokenExpiredException extends RuntimeException {
	public PasswordTokenExpiredException() {
		super("비밀번호 토큰이 만료되었습니다.");
	}
	public PasswordTokenExpiredException(String message) {
		super(message);
	}
}
