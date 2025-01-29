package com.be.domain.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.be.db.repository.UserRepository;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.RegisterResponse;
import com.be.domain.auth.response.TokenRefreshResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public RegisterResponse register(RegisterRequest request) {
		return null;
	}

	@Override
	public CheckUserIdResponse checkUserId(String userId) {
		return null;
	}

	@Override
	public CheckEmailResponse checkEmail(String email) {
		return null;
	}

	@Override
	public LoginResponse login(LoginRequest request) {
		return null;
	}

	@Override
	public TokenRefreshResponse tokenRefresh(Long id, TokenRefreshRequest request) {
		return null;
	}

	@Override
	public void logout(Long id, LogoutRequest request) {

	}
}
