package com.be.common.exception.handler;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.be.common.exception.BlackTokenException;
import com.be.common.exception.DuplicateEmailException;
import com.be.common.exception.DuplicateUserIDException;
import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.UserNotFoundException;
import com.be.common.model.response.BaseResponseBody;

@Order(1)
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

	@ExceptionHandler(DuplicateUserIDException.class)
	public ResponseEntity<BaseResponseBody> handleDuplicateUserException(DuplicateUserIDException e) {
		return ResponseEntity
			.status(HttpStatus.CONFLICT) // 409 Conflict
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.CONFLICT.value()));
	}

	@ExceptionHandler(DuplicateEmailException.class)
	public ResponseEntity<BaseResponseBody> handleDuplicateEmailException(DuplicateEmailException e) {
		return ResponseEntity
			.status(HttpStatus.CONFLICT) // 409 Conflict
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.CONFLICT.value()));
	}

	@ExceptionHandler(BlackTokenException.class)
	public ResponseEntity<BaseResponseBody> handleBlackTokenException(BlackTokenException e) {
		return ResponseEntity
			.status(HttpStatus.FORBIDDEN) // 403 Forbidden
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.FORBIDDEN.value()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<BaseResponseBody> handleException(Exception e) {
		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500 Internal Server Error
			.body(BaseResponseBody.of("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR.value()));
	}
}
