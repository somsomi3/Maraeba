package com.be.common.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

	private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
	public CustomException(ErrorCode errorCode, String message) {
		super(errorCode.getMessage()+" : "+message);
		this.errorCode = errorCode;
	}
}
