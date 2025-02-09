package com.be.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
	USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),
	CLASS_NOT_FOUND("Class Data Not Found", HttpStatus.NOT_FOUND),
	SESSION_NOT_FOUND("Session Not Found", HttpStatus.NOT_FOUND),
	STAT_NOT_FOUND("Stat Not Found", HttpStatus.NOT_FOUND),
	ROOM_NOT_FOUND("Room Not Found", HttpStatus.NOT_FOUND);

	private final String message;
	private final HttpStatus status;

	ErrorCode(String message, HttpStatus status) {
		this.message = message;
		this.status = status;
	}
}