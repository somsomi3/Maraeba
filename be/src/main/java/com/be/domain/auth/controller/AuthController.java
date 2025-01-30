package com.be.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;
import com.be.domain.auth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<? extends BaseResponseBody> register(@Valid @RequestBody RegisterRequest request) {
		authService.register(request);
		return ResponseEntity.status(201).body(BaseResponseBody.of("User registered successfully", 201));
	}

	@GetMapping("/check-user-id")
	public ResponseEntity<? extends BaseResponseBody> checkUserId(@Valid @RequestParam String userId) {
		CheckUserIdResponse response = authService.checkUserId(userId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	@GetMapping("/check-email")
	public ResponseEntity<? extends BaseResponseBody> checkEmail(@Valid @RequestParam String email) {
		CheckEmailResponse response = authService.checkEmail(email);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	@PostMapping("/login")
	public ResponseEntity<? extends BaseResponseBody> login(@Valid @RequestBody LoginRequest request) {
		LoginResponse response = authService.login(request);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	@PostMapping("/token")
	public ResponseEntity<? extends BaseResponseBody> tokenRefresh(@Valid @RequestBody TokenRefreshRequest request) {
		TokenRefreshResponse response = authService.tokenRefresh(request);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	@PostMapping("/logout")
	public ResponseEntity<? extends BaseResponseBody> logout(HttpServletRequest httpServletRequest, @Valid @RequestBody LogoutRequest request) {
		authService.logout(httpServletRequest, request);
		return ResponseEntity.ok(BaseResponseBody.of("Logout successfully", 200));
	}
}
