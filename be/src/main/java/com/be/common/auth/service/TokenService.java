package com.be.common.auth.service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import com.be.common.auth.TokenType;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.TokenErrorCode;
import com.be.db.entity.AccessTokenBlacklist;
import com.be.db.repository.AccessTokenBlacklistRepository;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService {

	@Value("${jwt.secret.key}")
	private String secretKey;

	@Value("${jwt.expiration.access-token}")
	private long accessTokenValiditySeconds;

	@Value("${jwt.expiration.refresh-token}")
	private long refreshTokenValiditySeconds;

	private SecretKey key;

	@PostConstruct
	public void init() {
		this.key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
	}

	private final AccessTokenBlacklistRepository accessTokenBlacklistRepository;

	@Getter
	@AllArgsConstructor
	public static class TokenWithExpiration {
		private final String token;
		private final Date expiration;
	}

	/**
	 * 토큰 생성
	 */
	public String generateToken(Long id, TokenType type) {
		long expirationTime = selectExpirationTime(type);
		return Jwts.builder()
			.subject(String.valueOf(id))
			.issuedAt(new Date())
			.expiration(new Date(System.currentTimeMillis() + expirationTime))
			.signWith(key)
			.compact();
	}

	/**
	 * 토큰 생성 (만료일 포함)
	 */
	public TokenWithExpiration generateTokenWithExpiration(Long id, TokenType type) {
		long expirationTime = selectExpirationTime(type);
		Date expiration = new Date(System.currentTimeMillis() + expirationTime);
		String token = Jwts.builder()
			.subject(String.valueOf(id))
			.issuedAt(new Date())
			.expiration(expiration)
			.signWith(key)
			.compact();
		return new TokenWithExpiration(token, expiration);
	}

	/**
	 * Refresh Token을 담은 쿠키 생성
	 */
	public ResponseCookie createRefreshTokenCookie(String refreshToken) {
		return ResponseCookie.from("refreshToken", refreshToken)
			.httpOnly(true)
			.secure(false) // HTTPS 환경에서만 전송
			.path("/") // 모든 경로에서 사용 가능
			.maxAge(refreshTokenValiditySeconds) // application.yml의 유효기간을 사용
			.sameSite("Strict") // CSRF 방지
			.build();
	}

	/**
	 * Refresh Token을 담은 쿠키 제거
	 */
	public ResponseCookie deleteRefreshTokenCookie() {
		return ResponseCookie.from("refreshToken", "")
			.httpOnly(true)
			.secure(false) // HTTPS 환경에서만 전송
			.path("/") // 모든 경로에서 사용 가능
			.maxAge(0) // application.yml의 유효기간을 사용
			.sameSite("Strict") // CSRF 방지
			.build();
	}

	/**
	 * 토큰 유효 검사
	 */
	public boolean validateToken(String token) {
		if (isBlacklisted(token)) {
			throw new CustomTokenException(TokenErrorCode.ACCESS_TOKEN_BLACK);
		}
		try {
			Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token);
			return true;
		} catch (ExpiredJwtException e) {
			return false; // 만료된 토큰 (별도 예외 처리 가능)
		} catch (JwtException e) {
			return false;
		}
	}

	/**
	 * Access Token 블랙리스트 추가
	 */
	public void addToBlacklist(String token) {
		Date expiration = getExpirationDate(token);
		if (expiration != null) {
			AccessTokenBlacklist accessTokenBlacklist = new AccessTokenBlacklist();
			accessTokenBlacklist.setToken(token);
			accessTokenBlacklist.setExpiryDate(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
			accessTokenBlacklistRepository.save(accessTokenBlacklist);
		}
	}

	/**
	 * Access Token 블랙리스트 확인
	 */
	public boolean isBlacklisted(String token) {
		return accessTokenBlacklistRepository.existsByToken(token);
	}

	/**
	 * 토큰에서 유저고유번호 추출
	 */
	public Long extractUserIdFromToken(String token) {
		try {
			return Long.parseLong(Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject());
		} catch (ExpiredJwtException e) {
			return Long.parseLong(e.getClaims().getSubject());
		} catch (JwtException e) {
			throw new IllegalArgumentException("Invalid token", e);
		}
	}

	/**
	 * 토큰 생성 시 유효시간 선택
	 */
	private long selectExpirationTime(TokenType type) {
		return type == TokenType.ACCESS_TOKEN ? accessTokenValiditySeconds : refreshTokenValiditySeconds;
	}

	/**
	 * 토큰에서 유효시간 추출
	 */
	public Date getExpirationDate(String token) {
		try {
			return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getExpiration();
		} catch (ExpiredJwtException e) {
			return e.getClaims().getExpiration();
		} catch (JwtException e) {
			throw new IllegalArgumentException("Invalid token", e);
		}
	}

	/**
	 * 요청에서 Bearer 제거
	 */
	public String extractAccessToken(HttpServletRequest request) {
		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			return authorizationHeader.substring(7); // "Bearer " 이후의 값 추출
		}
		throw new IllegalArgumentException("Access Token is missing or invalid");
	}
}
