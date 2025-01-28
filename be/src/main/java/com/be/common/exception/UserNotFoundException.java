package com.be.common.exception;

public class UserNotFoundException extends RuntimeException {

	public UserNotFoundException() {
		super("User not found.");
	}

	public UserNotFoundException(String message) {
		super(message);
	}
}
