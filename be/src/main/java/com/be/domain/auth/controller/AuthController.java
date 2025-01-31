package com.be.domain.auth.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.auth.TokenService;

@RestController
@RequestMapping("/auth")
public class AuthController {
	private final TokenService tokenService;

	public AuthController(TokenService tokenService) {
		this.tokenService = tokenService;
	}
}
