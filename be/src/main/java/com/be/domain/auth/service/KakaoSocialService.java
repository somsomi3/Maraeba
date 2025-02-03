package com.be.domain.auth.service;

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

import com.be.domain.auth.dto.SocialUser;

@Service
public class KakaoSocialService implements SocialService {

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
}
