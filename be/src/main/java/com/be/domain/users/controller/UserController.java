package com.be.domain.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.exception.UserNotFoundException;
import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.User;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import com.be.domain.users.response.GetCurrentUserResponse;
import com.be.domain.users.service.UserService;

@RequestMapping("/users")
@RestController
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	//사용자 정보 조회
	@GetMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> getCurrentUser(@AuthenticationPrincipal Long id) {
		try {
			User user = userService.getCurrentUser(id);
			return ResponseEntity.ok(GetCurrentUserResponse.from(user));
		} catch (UserNotFoundException e) {
			return ResponseEntity.notFound().build();
		}

	}

	@PatchMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> updateUser(@RequestBody UserUpdateRequest request) {
		//사용자 정보 수정
		return null;
	}

	@PatchMapping("/me/password")
	public ResponseEntity<? extends BaseResponseBody> updatePassword(@RequestBody PasswordUpdateRequest request) {
		//사용자 비밀번호 변경
		return null;
	}

	@DeleteMapping("/me")
	public ResponseEntity<? extends BaseResponseBody> deleteUser(@RequestBody PasswordRequest request) {
		//회원 탈퇴
		return null;
	}
}
