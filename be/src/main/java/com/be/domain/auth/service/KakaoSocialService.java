package com.be.domain.auth.service;

import java.time.ZoneId;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.be.common.auth.TokenType;
import com.be.common.auth.service.TokenService;
import com.be.db.entity.RefreshToken;
import com.be.db.entity.User;
import com.be.db.repository.RefreshTokenRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.auth.dto.SocialUser;
import com.be.domain.auth.response.LoginResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KakaoSocialService implements SocialService {

	private final UserRepository userRepository;
	private final TokenService tokenService;
	private final RefreshTokenRepository refreshTokenRepository;

	@Value("${spring.security.oauth2.client.provider.kakao.token-uri}")
	private String KAKAO_TOKEN_URL;

	@Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
	private String KAKAO_USER_INFO_URL;

	@Value("${spring.security.oauth2.client.registration.kakao.client-id}")
	private String CLIENT_ID;

	@Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
	private String CLIENT_SECRET;

	@Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
	private String REDIRECT_URI;

	@Value("${spring.security.oauth2.client.provider.kakao.authorization-uri}")
	private String AUTHORIZATION_URI;

	private final RestTemplate restTemplate = new RestTemplate();

	@Override
	public String getAuthorizationUrl() {
		return AUTHORIZATION_URI
			+ "?client_id=" + CLIENT_ID
			+ "&redirect_uri=" + REDIRECT_URI
			+ "&response_type=code";
	}

	@Override
	public String getAccessToken(String code) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
		params.add("grant_type", "authorization_code");
		params.add("client_id", CLIENT_ID);
		params.add("client_secret", CLIENT_SECRET);
		params.add("redirect_uri", REDIRECT_URI);
		params.add("code", code);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
		ResponseEntity<Map> response = restTemplate.postForEntity(KAKAO_TOKEN_URL, request, Map.class);

		return response.getBody().get("access_token").toString();
	}

	@Override
	public SocialUser getUserInfo(String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<Void> request = new HttpEntity<>(headers);
		ResponseEntity<Map> response = restTemplate.exchange(KAKAO_USER_INFO_URL, HttpMethod.GET, request, Map.class);

		Map<String, Object> userInfo = response.getBody();
		Map<String, Object> kakaoAccount = (Map<String, Object>)userInfo.get("kakao_account");
		Map<String, Object> profile = (Map<String, Object>)kakaoAccount.get("profile");

		return new SocialUser(
			"kakao",
			userInfo.get("id").toString(),
			kakaoAccount.get("email").toString(),
			profile.get("nickname").toString()
		);
	}

	@Override
	public LoginResponse socialLogin(SocialUser socialUser) {
		String userId = socialUser.getProvider()+"_"+socialUser.getProviderId();
		User user = userRepository.findByUserId(userId)
			.orElseGet(()->{
				User newUser = new User();
				newUser.setUserId(userId);
				newUser.setEmail(socialUser.getEmail());
				newUser.setUsername(socialUser.getNickname());
				newUser.setProvider(socialUser.getProvider());
				newUser.setProviderId(socialUser.getProviderId());
				userRepository.save(newUser);
				return newUser;
			});

		//accessToken 및 refreshToken 발급
		String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN);
		System.out.println("토큰 발급");
		TokenService.TokenWithExpiration refreshTokenWithExpiration = tokenService.generateTokenWithExpiration(
			user.getId(), TokenType.REFRESH_TOKEN);

		// 기존 Refresh Token이 있는지 확인
		RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(null);

		if (refreshToken != null) {
			// 기존 객체의 토큰 값을 변경하고 업데이트
			refreshToken.setToken(refreshTokenWithExpiration.getToken());
			refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime());
		} else {
			//refreshToken DB 저장
			refreshToken = new RefreshToken();
			refreshToken.setUser(user);
			refreshToken.setToken(refreshTokenWithExpiration.getToken());
			refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime());
			refreshTokenRepository.save(refreshToken);
		}
		System.out.println("accessToken: " + accessToken + ", refreshToken: " + refreshToken.getToken());
		return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());
	}
}
