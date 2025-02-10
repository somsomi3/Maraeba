package com.be.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SocialUserDTO {
	private String provider; // "kakao", "naver", "google"
	private String providerId; // 소셜 고유 ID
	private String email;
	private String name;
}
