package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SocialLoginSuccessResponse extends BaseResponseBody {
	private String provider; // "kakao", "naver", "google"
	private String providerId; // 소셜 고유 ID
	private String email;
	private String nickname;

	private SocialLoginSuccessResponse(String message, Integer status, String provider, String providerId, String email,
		String nickname) {
		super(message, status);
		this.provider = provider;
		this.providerId = providerId;
		this.email = email;
		this.nickname = nickname;
	}

	public static SocialLoginSuccessResponse of(String provider, String providerId, String email, String nickname) {
		return new SocialLoginSuccessResponse("Social Login successfully", 200, provider, providerId, email, nickname);
	}

}
