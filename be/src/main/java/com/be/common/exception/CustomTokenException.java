package com.be.common.exception;

import lombok.Getter;

@Getter
public class CustomTokenException extends RuntimeException {

	private final TokenErrorCode tokenErrorCode;

    public CustomTokenException(TokenErrorCode tokenErrorCode) {
        super(tokenErrorCode.getMessage());
        this.tokenErrorCode = tokenErrorCode;
    }
	public CustomTokenException(TokenErrorCode tokenErrorCode, String message) {
		super(tokenErrorCode.getMessage()+" : "+message);
		this.tokenErrorCode = tokenErrorCode;
	}
}
