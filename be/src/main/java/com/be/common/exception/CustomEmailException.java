package com.be.common.exception;

public class CustomEmailException extends RuntimeException {
	public CustomEmailException(String message) {
		super(message);
	}
}
