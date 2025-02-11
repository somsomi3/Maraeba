package com.be.common.exception.handler;

import org.springframework.core.annotation.Order;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.be.common.exception.CustomAuthException;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.CustomException;
import com.be.common.model.response.BaseResponseBody;

@Order(1)
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(CustomAuthException.class)
	public ResponseEntity<BaseResponseBody> handleCustomAuthException(CustomAuthException ex) {
		return ResponseEntity
			.status(ex.getAuthErrorCode().getStatus())
			.body(BaseResponseBody.of(ex.getAuthErrorCode().getMessage(), ex.getAuthErrorCode().getStatus()));
	}

	@ExceptionHandler(CustomTokenException.class)
	public ResponseEntity<BaseResponseBody> handleCustomTokenException(CustomTokenException ex) {
		return ResponseEntity
			.status(ex.getTokenErrorCode().getStatus())
			.body(BaseResponseBody.of(ex.getTokenErrorCode().getMessage(), ex.getTokenErrorCode().getStatus()));
	}


	@ExceptionHandler(CustomException.class)
	public ResponseEntity<BaseResponseBody> handleCustomException(CustomException ex) {
		return ResponseEntity
			.status(ex.getErrorCode().getStatus())
			.body(BaseResponseBody.of(ex.getErrorCode().getMessage(), ex.getErrorCode().getStatus()));
	}

	// @ExceptionHandler(Exception.class)
	// public ResponseEntity<BaseResponseBody> handleException(Exception e) {
	// 	return ResponseEntity
	// 		.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500 Internal Server Error
	// 		.body(BaseResponseBody.of("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR.value()));
	// }


}
