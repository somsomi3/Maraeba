package com.be.common.auth.temp;

import java.time.ZoneId;
import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.be.common.auth.TokenType;
import com.be.common.auth.service.TokenService;
import com.be.db.entity.RefreshToken;
import com.be.db.entity.User;
import com.be.db.repository.RefreshTokenRepository;
import com.be.db.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * OAuth 2.0의 자동 로그인이 아닌 JWT로 직접 인증 방법을 선택해서 무쓸모 코드가 됨...
 */

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final TokenService tokenService;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

		// 기본 제공된 OAuth2UserService 이용
		OAuth2User oAuth2User = super.loadUser(userRequest);

		// 사용자 정보 확인
		String provider = userRequest.getClientRegistration().getRegistrationId(); // kakao, google, naver
		String providerId = oAuth2User.getAttribute("id");

		Map<String, Object> kakaoAccount = oAuth2User.getAttribute("kakao_account");
		if (kakaoAccount == null || !kakaoAccount.containsKey("email")) {
			throw new IllegalArgumentException("필수 항목을 거절했습니다.");
		}
		String email = (String)kakaoAccount.get("email"); // 필수 동의 항목

		Map<String, Object> profile = (Map<String, Object>)kakaoAccount.get("profile");
		String nickname = (String)profile.get("nickname"); // 필수 동의 항목

		// 기존 회원 조회
		User user = userRepository.findByProviderAndProviderId(provider, providerId)
			.orElseGet(() -> saveUser(email, nickname, provider, providerId)); // 없으면 새로 생성

		// 기존 유저의 정보 업데이트 (닉네임, 이메일 변경 가능성 반영)
		user.setEmail(email);
		user.setUsername(nickname);
		userRepository.save(user);

		//소셜 로그인 유저 토큰 생성
		String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN);
		TokenService.TokenWithExpiration refreshTokenWithExpiration = tokenService.generateTokenWithExpiration(
			user.getId(), TokenType.REFRESH_TOKEN);

		// 기존 유저의 Refresh Token 업데이트
		RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId())
			.orElse(new RefreshToken()); // 기존 Refresh Token이 없으면 새로 생성

		refreshToken.setUser(user);
		refreshToken.setToken(refreshTokenWithExpiration.getToken());
		refreshToken.setExpiryDate(
			refreshTokenWithExpiration
				.getExpiration()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime()
		);
		refreshTokenRepository.save(refreshToken);

		// Spring Security 인증 객체 생성

		//유저 인증 객체 반환
		return new CustomOAuth2User(
			user,
			oAuth2User.getAttributes(),
			accessToken,
			refreshTokenWithExpiration.getToken()
		);
	}

	private User saveUser(String email, String nickname, String provider, String providerId) {
		User user = new User();
		user.setEmail(email);
		user.setProvider(provider);
		user.setProviderId(providerId);
		user.setUsername(nickname);
		return userRepository.save(user);
	}
}
