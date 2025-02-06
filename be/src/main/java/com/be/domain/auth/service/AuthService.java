package com.be.domain.auth.service;

import java.util.List;

import com.be.domain.auth.dto.UserIdResponseDto;
import com.be.domain.auth.request.FindUserIdRequest;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;

import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
	void register(RegisterRequest request);
	CheckUserIdResponse checkUserId(String userId);
	// CheckEmailResponse checkEmail(String email);
	LoginResponse login(LoginRequest request);
	TokenRefreshResponse tokenRefresh(String refreshToken);
	void logout(HttpServletRequest httpServletRequest);
	List<UserIdResponseDto> findUserIdsByEmail(FindUserIdRequest request);
}
