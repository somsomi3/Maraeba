package com.be.common.exception.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.UserNotFoundException;
import com.be.common.model.response.BaseResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<BaseResponseBody> handleUserNotFoundException(UserNotFoundException e) {
		return ResponseEntity
			.status(HttpStatus.NOT_FOUND)
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.NOT_FOUND.value()));
	}

	@ExceptionHandler(PasswordMismatchException.class)
	public ResponseEntity<BaseResponseBody> handlePasswordMismatchException(PasswordMismatchException e) {
		return ResponseEntity
			.status(HttpStatus.BAD_REQUEST)
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
	}
}
