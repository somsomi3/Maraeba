package com.be.domain.auth.response;

import java.time.LocalDateTime;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RegisterResponse extends BaseResponseBody {
	private Long id;
	private String userId;
	private String email;
	private String username;
	private String provider; // LOCAL KAKAO NAVER GOOGLE
	private LocalDateTime createdAt;

	private RegisterResponse(String message, Integer status, Long id, String userId, String email, String username, String provider, LocalDateTime createdAt) {
		super(message, status);
		this.id = id;
		this.userId = userId;
		this.email = email;
		this.username = username;
		this.provider = provider;
		this.createdAt = createdAt;
	}

	public RegisterResponse of(String message, Integer status, Long id, String userId, String email, String username, String provider, LocalDateTime createdAt) {
		return new RegisterResponse(message, status, id, userId, email, username, provider, createdAt);
	}
}
