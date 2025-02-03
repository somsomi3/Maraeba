package com.be.domain.auth.service;

import com.be.domain.auth.dto.SocialUser;

public interface SocialService {

	/**
	 * 소셜 로그인 페이지로 이동할 URL을 반환
	 */
	String getAuthorizationUrl();

	/**
	 * 인가 코드를 이용해 소셜 Access Token을 가져옴
	 */
	String getAccessToken(String code);

	/**
	 * Access Token을 이용해 사용자 정보를 가져옴
	 */
	SocialUser getUserInfo(String accessToken);
}