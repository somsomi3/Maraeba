package com.be.domain.auth.service;

import com.be.domain.auth.dto.SocialUserDTO;
import com.be.domain.auth.response.LoginResponse;

public interface SocialService {

	/**
	 * 인가 코드를 이용해 소셜 Access Token을 가져옴
	 */
	String getAccessToken(String code);

	/**
	 * Access Token을 이용해 사용자 정보를 가져옴
	 */
	SocialUserDTO getUserInfo(String accessToken);

	/**
	 * 가져온 사용자 정보로 로그인 또는 회원가입
	 */
	LoginResponse socialLogin(SocialUserDTO socialUser);

}