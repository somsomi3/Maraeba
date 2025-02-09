package com.be.common.exception;

import lombok.Getter;

@Getter
public class CustomAuthException extends RuntimeException {
	private final AuthErrorCode authErrorCode;

	public CustomAuthException(AuthErrorCode authErrorCode) {
		super(authErrorCode.getMessage());
		this.authErrorCode = authErrorCode;
	}
	public CustomAuthException(AuthErrorCode authErrorCode, String message) {
		super(authErrorCode.getMessage()+" : "+message);
		this.authErrorCode = authErrorCode;
	}
}
