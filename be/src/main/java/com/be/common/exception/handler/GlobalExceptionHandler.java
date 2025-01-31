package com.be.common.exception.handler;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.be.common.exception.CustomException;
import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.UserNotFoundException;
import com.be.common.model.response.BaseResponseBody;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<BaseResponseBody> handleUserNotFoundException(UserNotFoundException e) {
		return ResponseEntity
			.status(HttpStatus.NOT_FOUND)
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.NOT_FOUND));
	}

	@ExceptionHandler(PasswordMismatchException.class)
	public ResponseEntity<BaseResponseBody> handlePasswordMismatchException(PasswordMismatchException e) {
		return ResponseEntity
			.status(HttpStatus.BAD_REQUEST)
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.BAD_REQUEST));
	}

	@ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseResponseBody> handleCustomException(CustomException ex) {
		return ResponseEntity
			.status(ex.getErrorCode().getStatus())
			.body(BaseResponseBody.of(ex.getErrorCode().getMessage(), ex.getErrorCode().getStatus()));
    }
}
