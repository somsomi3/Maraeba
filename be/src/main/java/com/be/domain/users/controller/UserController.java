package com.be.domain.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import com.be.domain.users.response.GetCurrentUserResponse;
import com.be.domain.users.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	//사용자 정보 조회
	@GetMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> getCurrentUser(
		@AuthenticationPrincipal Long id) {
		GetCurrentUserResponse getCurrentUserResponse = userService.getCurrentUser(id);
		return ResponseEntity.status(getCurrentUserResponse.getStatus()).body(getCurrentUserResponse);
	}

	//사용자 정보 수정
	@PatchMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> updateUser(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody UserUpdateRequest request) {
		userService.updateUser(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("User information updated successfully.", 200));
	}

	//사용자 비밀번호 변경
	@PatchMapping("/me/password")
	public ResponseEntity<? extends BaseResponseBody> updatePassword(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody PasswordUpdateRequest request) {
		userService.updatePassword(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("Password updated successfully.", 200));
	}

	//회원 탈퇴
	@DeleteMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> deleteUser(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody PasswordRequest request) {
		userService.deleteUser(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("User deleted successfully.", 200));
	}
}
