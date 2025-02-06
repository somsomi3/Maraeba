package com.be.domain.auth.service;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.be.domain.auth.dto.SocialUserDTO;
import com.be.domain.auth.response.LoginResponse;

@Service
public class NaverSocialService implements SocialService {

	private static final String NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
	private static final String NAVER_USER_INFO_URL = "https://openapi.naver.com/v1/nid/me";
	private static final String CLIENT_ID = "YOUR_NAVER_CLIENT_ID";
	private static final String CLIENT_SECRET = "YOUR_NAVER_CLIENT_SECRET";
	private static final String REDIRECT_URI = "http://localhost:8081/auth/naver/callback";

	private final RestTemplate restTemplate = new RestTemplate();

	@Override
	public String getAuthorizationUrl() {
		return "";
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
		ResponseEntity<Map> response = restTemplate.postForEntity(NAVER_TOKEN_URL, request, Map.class);

		return response.getBody().get("access_token").toString();
	}

	@Override
	public SocialUserDTO getUserInfo(String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<Void> request = new HttpEntity<>(headers);
		ResponseEntity<Map> response = restTemplate.exchange(NAVER_USER_INFO_URL, HttpMethod.GET, request, Map.class);

		Map<String, Object> userInfo = (Map<String, Object>)response.getBody().get("response");

		return new SocialUserDTO(
			"naver",
			userInfo.get("id").toString(),
			userInfo.get("email").toString(),
			userInfo.get("nickname").toString()
		);
	}

	@Override
	public LoginResponse socialLogin(SocialUserDTO socialUser) {
		return new LoginResponse();
	}
}
