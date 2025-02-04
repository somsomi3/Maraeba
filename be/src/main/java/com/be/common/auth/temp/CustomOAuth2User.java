package com.be.common.auth.temp;

import java.util.Map;

import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import com.be.db.entity.User;

import lombok.Getter;

/**
 * OAuth 2.0의 자동 로그인이 아닌 JWT로 직접 인증 방법을 선택해서 무쓸모 코드가 됨...
 */
@Getter
public class CustomOAuth2User extends DefaultOAuth2User {

	private final User user;
	private final String accessToken;
	private final String refreshToken;

	public CustomOAuth2User(User user, Map<String, Object> attributes, String accessToken, String refreshToken) {
		super(null, attributes, "id");
		this.user = user;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}
