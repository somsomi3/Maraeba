package com.be.common.exception.handler;

import org.springframework.core.annotation.Order;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.be.common.exception.AccessTokenException;
import com.be.common.exception.BlackTokenException;
import com.be.common.exception.DuplicateEmailException;
import com.be.common.exception.DuplicateUserIDException;
import com.be.common.exception.CustomException;
import com.be.common.exception.KakaoUserInfoException;
import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.PasswordTokenExpiredException;
import com.be.common.exception.PasswordTokenNotFoundException;
import com.be.common.exception.SocialLoginException;
import com.be.common.exception.UserNotFoundException;
import com.be.common.model.response.BaseResponseBody;

@Order(1)
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

	@ExceptionHandler(AccessTokenException.class)
	public ResponseEntity<BaseResponseBody> handleAccessTokenException(AccessTokenException e) {
		return ResponseEntity
			.status(HttpStatus.FORBIDDEN) // 403 Forbidden
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.FORBIDDEN.value()));
	}

	@ExceptionHandler(KakaoUserInfoException.class)
	public ResponseEntity<BaseResponseBody> handleKakaoUserInfoException(KakaoUserInfoException e) {
		return ResponseEntity
			.status(HttpStatus.FORBIDDEN) // 403 Forbidden
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.FORBIDDEN.value()));
	}

	@ExceptionHandler(SocialLoginException.class)
	public ResponseEntity<BaseResponseBody> handleSocialLoginException(SocialLoginException e) {
		return ResponseEntity
			.status(HttpStatus.FORBIDDEN) // 403 Forbidden
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.FORBIDDEN.value()));
	}

	@ExceptionHandler(PasswordTokenNotFoundException.class)
	public ResponseEntity<BaseResponseBody> handlePasswordTokenNotFoundException(PasswordTokenNotFoundException e) {
		return ResponseEntity
			.status(HttpStatus.NOT_FOUND) // 403 Not_Found
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.NOT_FOUND.value()));
	}

	@ExceptionHandler(PasswordTokenExpiredException.class)
	public ResponseEntity<BaseResponseBody> handlePasswordTokenExpiredException(PasswordTokenExpiredException e) {
		return ResponseEntity
			.status(HttpStatus.GONE) // 410 Gone
			.body(BaseResponseBody.of(e.getMessage(), HttpStatus.GONE.value()));
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
