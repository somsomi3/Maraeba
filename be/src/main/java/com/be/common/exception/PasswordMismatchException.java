package com.be.common.exception;

public class PasswordMismatchException extends RuntimeException {
	public PasswordMismatchException() {
		super("The password is incorrect.");
	}

	public PasswordMismatchException(String message) {
		super(message);
	}
}
