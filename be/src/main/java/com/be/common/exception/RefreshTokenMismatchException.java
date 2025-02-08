package com.be.common.exception;

public class RefreshTokenMismatchException extends RuntimeException {
    public RefreshTokenMismatchException(String message) {
        super(message);
    }
}