package com.be.domain.auth.service;

import java.time.ZoneId;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.be.common.auth.TokenType;
import com.be.common.auth.service.TokenService;
import com.be.common.exception.AuthErrorCode;
import com.be.common.exception.CustomAuthException;
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
public class NaverSocialService implements SocialService {

	private final UserRepository userRepository;
	private final TokenService tokenService;
	private final RefreshTokenRepository refreshTokenRepository;

	@Value("${social.naver.token-uri}")
	private String NAVER_TOKEN_URL;

	@Value("${social.naver.user-info-uri}")
	private String NAVER_USER_INFO_URL;

	@Value("${social.naver.client-id}")
	private String CLIENT_ID;

	@Value("${social.naver.client-secret}")
	private String CLIENT_SECRET;

	@Value("${social.naver.redirect-uri}")
	private String REDIRECT_URI;

	@Value("${social.naver.state-string}")
	private String STATE_STRING;

	private final RestTemplate restTemplate = new RestTemplate();

	@Override
	public String getAccessToken(String code) {
		log.info("[Service]getAccessToken 메서드 들어옴");
		// 1. 인가 코드 검증
		if (code == null || code.isBlank()) {
			throw new CustomTokenException(TokenErrorCode.NAVER_AUTH_CODE_NOT_EXIST);
		}
		log.info("[Service]getAccessToken 인가 코드 검증 통과");
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("grant_type", "authorization_code");
			params.add("client_id", CLIENT_ID);
			params.add("client_secret", CLIENT_SECRET);
			params.add("redirect_uri", REDIRECT_URI);
			params.add("code", code);
			params.add("state", STATE_STRING);

			HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
			log.info("[Service]getAccessToken 액세스 토큰 요청 전");
			ResponseEntity<Map> response = restTemplate.postForEntity(NAVER_TOKEN_URL, request, Map.class);
			log.info("[Service]getAccessToken 액세스 토큰 요청 후");
			// 2. 응답 값 검증
			if (response.getBody() == null) {
				throw new CustomTokenException(TokenErrorCode.NAVER_ACCESS_TOKEN_NOT_EXIST, "네이버 응답이 비어 있습니다.");
			}

			if (!response.getBody().containsKey("access_token")) {
				if (response.getBody().containsKey("error")) {
					String errorMessage = Optional.ofNullable(response.getBody().get("error_description"))
						.map(Object::toString)
						.orElse("네이버에서 오류가 발생했습니다.");
					throw new CustomTokenException(TokenErrorCode.NAVER_ACCESS_TOKEN_NOT_EXIST, errorMessage);
				}
				throw new CustomTokenException(TokenErrorCode.NAVER_ACCESS_TOKEN_NOT_EXIST);
			}

			// 3. 액세스 토큰 반환
			return response.getBody().get("access_token").toString();
		} catch (RestClientException e) {
			throw new CustomTokenException(TokenErrorCode.NAVER_ACCESS_TOKEN_REQUEST_FAILED, e.getMessage());
		}
	}

	@Override
	public SocialUserDTO getUserInfo(String accessToken) {
		log.info("[Service]getUserInfo 메서드 들어옴");
		// 1. 액세스 토큰 검증
		if (accessToken == null || accessToken.isBlank()) {
			throw new CustomTokenException(TokenErrorCode.NAVER_ACCESS_TOKEN_NOT_PROVIDED);
		}
		log.info("[Service]getUserInfo 액세스 토큰 검증 통과");
		try {
			// 2. 요청 헤더 설정 (Bearer Token)
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			HttpEntity<Void> request = new HttpEntity<>(headers);
			log.info("[Service]getUserInfo 유저 정보 요청 전");
			ResponseEntity<Map> response = restTemplate.exchange(NAVER_USER_INFO_URL, HttpMethod.GET, request, Map.class);
			log.info("[Service]getUserInfo 유저 정보 요청 후");
			// 3. 응답 값 검증
			if (response.getBody() == null || !response.getBody().containsKey("response")) {
				throw new CustomTokenException(TokenErrorCode.NAVER_USER_INFO_NOT_EXIST, "네이버 응답 데이터가 없습니다.");
			}

			// 4. 유저 정보 추출
			Map<String, Object> userInfo = (Map<String, Object>) response.getBody().get("response");

			if (!userInfo.containsKey("id") || !userInfo.containsKey("email") || !userInfo.containsKey("name")) {
				throw new CustomTokenException(TokenErrorCode.NAVER_USER_INFO_INCOMPLETE, "필수 사용자 정보가 없습니다.");
			}

			return new SocialUserDTO(
				"NAVER",
				userInfo.get("id").toString(),
				userInfo.get("email").toString(),
				userInfo.get("name").toString()
			);
		} catch (RestClientException e) {
			throw new CustomTokenException(TokenErrorCode.NAVER_USER_INFO_REQUEST_FAILED, e.getMessage());
		}
	}

	@Transactional
	@Override
	public LoginResponse socialLogin(SocialUserDTO socialUser) {
		log.info("[Service]socialLogin 메서드 들어옴");
		// 1. 입력값 검증
		if (socialUser == null || socialUser.getProvider() == null || socialUser.getProviderId() == null
			|| socialUser.getEmail() == null || socialUser.getName() == null) {
			throw new CustomAuthException(AuthErrorCode.SOCIAL_USER_INFO_INVALID,"네이버 유저 정보 없음");
		}
		log.info("[Service]socialLogin 유저 정보 입력 값 검증");
		try {
			String userId = socialUser.getProvider() + "_" + socialUser.getProviderId();

			// 2. 기존 사용자 조회 or 신규 생성
			User user = userRepository.findByUserId(userId)
				.orElseGet(() -> {
					User newUser = new User();
					newUser.setUserId(userId);
					newUser.setEmail(socialUser.getEmail());
					newUser.setUsername(socialUser.getName());
					newUser.setProvider(socialUser.getProvider());
					newUser.setProviderId(socialUser.getProviderId());
					return userRepository.save(newUser);
				});

			// 3. Access Token 생성
			String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN)
				.orElseThrow(() -> new CustomTokenException(
					TokenErrorCode.TOKEN_GENERATION_FAILED, "네이버 소셜 로그인 액세스 토큰 생성 실패"));

			// 4. Refresh Token 생성
			TokenService.TokenWithExpiration refreshTokenWithExpiration =
				tokenService.generateTokenWithExpiration(user.getId(), TokenType.REFRESH_TOKEN)
					.orElseThrow(() -> new CustomTokenException(
						TokenErrorCode.TOKEN_GENERATION_FAILED, "네이버 소셜 로그인 리프레시 토큰 생성 실패"));

			// 5. Refresh Token 저장 or 업데이트
			RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(null);

			if (refreshToken != null) {
				log.info("해당 유저 고유 번호의 리프레시 토큰이 존재함");
				refreshToken.setToken(refreshTokenWithExpiration.getToken());
				refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
					.toInstant()
					.atZone(ZoneId.systemDefault())
					.toLocalDateTime());
				refreshTokenRepository.save(refreshToken);
			} else {
				log.info("해당 유저의 리프레시 토큰이 존재하지 않음");
				try {
					refreshToken = new RefreshToken();
					refreshToken.setUser(user);
					refreshToken.setToken(refreshTokenWithExpiration.getToken());
					refreshToken.setExpiryDate(
						refreshTokenWithExpiration.getExpiration().toInstant()
							.atZone(ZoneId.systemDefault()).toLocalDateTime());
					refreshTokenRepository.save(refreshToken);
				} catch (Exception e) {
					throw new CustomException(ErrorCode.DATABASE_ERROR, "Refresh Token DB 저장 에러 " + e.getMessage());
				}
			}

			log.info("✅ 네이버 소셜 로그인 성공 - accessToken: {}, refreshToken: {}", accessToken, refreshToken.getToken());
			return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());

		} catch (CustomTokenException e) {
			log.error("❌ 토큰 생성 실패: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("❌ 네이버 소셜 로그인 처리 실패: {}", e.getMessage(), e);
			throw new CustomException(ErrorCode.SOCIAL_LOGIN_FAILED, e.getMessage());
		}
	}
}
