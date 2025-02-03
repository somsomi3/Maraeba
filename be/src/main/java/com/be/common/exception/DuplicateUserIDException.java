package com.be.common.exception;

public class DuplicateUserIDException extends RuntimeException {
    public DuplicateUserIDException() {super("User ID already exists.");}
    public DuplicateUserIDException(String message) {
        super(message);
    }
}