package com.be.domain.auth.service;

import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;

import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
	void register(RegisterRequest request);
	CheckUserIdResponse checkUserId(String userId);
	CheckEmailResponse checkEmail(String email);
	LoginResponse login(LoginRequest request);
	TokenRefreshResponse tokenRefresh(TokenRefreshRequest request);
	void logout(HttpServletRequest httpServletRequest, LogoutRequest request);
}
