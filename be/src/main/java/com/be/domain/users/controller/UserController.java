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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@Operation(summary = "현재 사용자 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "사용자 정보 조회 성공",
			content = @Content(schema = @Schema(implementation = GetCurrentUserResponse.class))),
		@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	@GetMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> getCurrentUser(
		@AuthenticationPrincipal Long id) {
		GetCurrentUserResponse getCurrentUserResponse = userService.getCurrentUser(id);
		return ResponseEntity.status(getCurrentUserResponse.getStatus()).body(getCurrentUserResponse);
	}

	@Operation(summary = "사용자 정보 수정", description = "사용자의 이메일 또는 이름을 변경합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "사용자 정보 수정 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	@PatchMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> updateUser(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody UserUpdateRequest request) {
		userService.updateUser(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("User information updated successfully.", 200));
	}

	@Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "비밀번호 변경 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	@PatchMapping("/me/password")
	public ResponseEntity<? extends BaseResponseBody> updatePassword(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody PasswordUpdateRequest request) {
		userService.updatePassword(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("Password updated successfully.", 200));
	}

	@Operation(summary = "회원 탈퇴", description = "사용자가 계정을 삭제합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "회원 탈퇴 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	@DeleteMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> deleteUser(
		@AuthenticationPrincipal Long id,
		@Valid @RequestBody PasswordRequest request) {
		userService.deleteUser(id, request);
		return ResponseEntity.ok(BaseResponseBody.of("User deleted successfully.", 200));
	}
}
