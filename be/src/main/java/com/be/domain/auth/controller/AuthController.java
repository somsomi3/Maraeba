package com.be.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.auth.TokenService;
import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.request.RegisterRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {
	private final TokenService tokenService;

	public AuthController(TokenService tokenService) {
		this.tokenService = tokenService;
	}

	@PostMapping("/register")
	public ResponseEntity<? extends BaseResponseBody> register(@RequestBody RegisterRequest registerRequest) {
		return ResponseEntity.ok(BaseResponseBody.of("register successfully",200));
	}

}
