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
import com.be.common.exception.CustomException;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.ErrorCode;
import com.be.common.exception.TokenErrorCode;
import com.be.db.entity.RefreshToken;
import com.be.db.entity.User;
import com.be.db.repository.RefreshTokenRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.auth.dto.SocialUserDTO;
import com.be.domain.auth.response.LoginResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
		try {
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

			if (response.getBody() == null || !response.getBody().containsKey("access_token")) {
				throw new CustomTokenException(TokenErrorCode.KAKAO_ACCESS_TOKEN_NOT_EXIST);
			}
			return response.getBody().get("access_token").toString();
		} catch (Exception e) {
			throw new CustomTokenException(TokenErrorCode.KAKAO_ACCESS_TOKEN_NOT_EXIST, e.getMessage());
		}
	}

	@Override
	public SocialUserDTO getUserInfo(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			HttpEntity<Void> request = new HttpEntity<>(headers);
			ResponseEntity<Map> response = restTemplate.exchange(KAKAO_USER_INFO_URL, HttpMethod.GET, request, Map.class);

			Map<String, Object> userInfo = response.getBody();
			if (userInfo == null || !userInfo.containsKey("kakao_account")) {
				throw new CustomException(ErrorCode.KAKAO_USER_INFO_NOT_EXIST,"Kakao account information is missing");
			}
			Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
			if (kakaoAccount == null || !kakaoAccount.containsKey("profile")) {
				throw new CustomException(ErrorCode.KAKAO_USER_INFO_NOT_EXIST,"Kakao profile information is missing");
			}
			Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

			// 추가로 각 필드에 대한 null 체크를 할 수 있음
			if (userInfo.get("id") == null || kakaoAccount.get("email") == null || profile.get("nickname") == null) {
				throw new CustomException(ErrorCode.KAKAO_USER_INFO_NOT_EXIST, "필수 항목에 null값 존재");
			}

			return new SocialUserDTO(
				"kakao",
				userInfo.get("id").toString(),
				kakaoAccount.get("email").toString(),
				profile.get("nickname").toString()
			);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.KAKAO_USER_INFO_NOT_EXIST, e.getMessage());
		}
	}

	@Override
	public LoginResponse socialLogin(SocialUserDTO socialUser) {
		try {
			String userId = socialUser.getProvider() + "_" + socialUser.getProviderId();
			User user = userRepository.findByUserId(userId)
				.orElseGet(() -> {
					User newUser = new User();
					newUser.setUserId(userId);
					newUser.setEmail(socialUser.getEmail());
					newUser.setUsername(socialUser.getNickname());
					newUser.setProvider(socialUser.getProvider());
					newUser.setProviderId(socialUser.getProviderId());
					return userRepository.save(newUser);
				});

			String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN);
			log.info("토큰 발급");
			TokenService.TokenWithExpiration refreshTokenWithExpiration = tokenService.generateTokenWithExpiration(
				user.getId(), TokenType.REFRESH_TOKEN);

			RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(null);

			if (refreshToken != null) {
				refreshToken.setToken(refreshTokenWithExpiration.getToken());
				refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
					.toInstant()
					.atZone(ZoneId.systemDefault())
					.toLocalDateTime());
			} else {
				refreshToken = new RefreshToken();
				refreshToken.setUser(user);
				refreshToken.setToken(refreshTokenWithExpiration.getToken());
				refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
					.toInstant()
					.atZone(ZoneId.systemDefault())
					.toLocalDateTime());
				refreshTokenRepository.save(refreshToken);
			}
			log.info("accessToken: {}, refreshToken: {}", accessToken, refreshToken.getToken());
			return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());
		} catch (Exception e) {
			throw new CustomException(ErrorCode.SOCIAL_LOGIN_FAILED);
		}
	}
}
