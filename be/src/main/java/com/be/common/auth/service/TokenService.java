package com.be.common.auth.service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

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
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
	public Optional<String> generateToken(Long id, TokenType type) {
		try {
			long expirationTime = selectExpirationTime(type);
			String token = Jwts.builder()
				.subject(String.valueOf(id))
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expirationTime))
				.signWith(key)
				.compact();
			return Optional.of(token);
		} catch (Exception e) {
			return Optional.empty(); // 예외를 던지지 않고 Optional.empty() 반환
		}
	}

	/**
	 * 토큰 생성 (만료일 포함)
	 */
	public Optional<TokenWithExpiration> generateTokenWithExpiration(Long id, TokenType type) {
		try {
			long expirationTime = selectExpirationTime(type);
			Date expiration = new Date(System.currentTimeMillis() + expirationTime);
			String token = Jwts.builder()
				.subject(String.valueOf(id))
				.issuedAt(new Date())
				.expiration(expiration)
				.signWith(key)
				.compact();
			return Optional.of(new TokenWithExpiration(token, expiration));
		} catch (Exception e) {
			return Optional.empty();
		}
	}

	/**
	 * Refresh Token을 담은 쿠키 생성
	 */
	public ResponseCookie createRefreshTokenCookie(String refreshToken) {
		if (refreshToken == null || refreshToken.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_PROVIDED);
		}

		try {
			return ResponseCookie.from("refreshToken", refreshToken)
				.httpOnly(true)
				.secure(false) // HTTPS 환경에서만 전송
				.path("/") // 모든 경로에서 사용 가능
				.maxAge(refreshTokenValiditySeconds) // application.yml의 유효기간을 사용
				.sameSite("Lax") // CSRF 방지
				.build();
		} catch (Exception e) {
			throw new CustomTokenException(TokenErrorCode.COOKIE_CREATION_FAILED, e.getMessage());
		}
	}

	/**
	 * Refresh Token을 담은 쿠키 제거
	 */
	public ResponseCookie deleteRefreshTokenCookie() {
		try {
			return ResponseCookie.from("refreshToken", "")
				.httpOnly(true)
				.secure(false) // HTTPS 환경에서만 전송
				.path("/") // 모든 경로에서 사용 가능
				.maxAge(0) // application.yml의 유효기간을 사용
				.sameSite("Lax") // CSRF 방지
				.build();
		} catch (Exception e) {
			throw new CustomTokenException(TokenErrorCode.COOKIE_CREATION_FAILED, e.getMessage());
		}
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
		// 1. Access Token 검증
		if (token == null || token.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.ACCESS_TOKEN_NOT_PROVIDED);
		}

		try {
			Date expiration = getExpirationDate(token);
			if (expiration != null) {
				AccessTokenBlacklist accessTokenBlacklist = new AccessTokenBlacklist();
				accessTokenBlacklist.setToken(token);
				accessTokenBlacklist.setExpiryDate(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

				accessTokenBlacklistRepository.save(accessTokenBlacklist);
				log.info("✅ Access Token 블랙리스트 등록 완료: {}", token);
			} else {
				log.info("✅ 이미 만료된 Access Token: {}", token);
			}
		} catch (Exception e) {
			log.error("❌ Access Token 블랙리스트 저장 실패: {}", e.getMessage(), e);
			throw new CustomTokenException(TokenErrorCode.BLACKLIST_SAVE_FAILED, e.getMessage());
		}
	}

	/**
	 * Access Token 블랙리스트 확인
	 */
	public boolean isBlacklisted(String token) {
		return accessTokenBlacklistRepository.existsByToken(token);
	}

	/**
	 * 토큰에서 유저 고유번호 추출
	 */
	public Optional<Long> extractUserIdFromToken(String token) {
		try {
			return Optional.of(Long.parseLong(Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject()));
		} catch (ExpiredJwtException e) {
			return Optional.of(Long.parseLong(e.getClaims().getSubject()));
		} catch (JwtException e) {
			return Optional.empty(); // 예외를 던지지 않고 Optional.empty() 반환
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
			throw new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN, "Invalid token format");
		}
	}

	/**
	 * 요청에서 Bearer 제거
	 */
	public String extractAccessToken(HttpServletRequest request) {
		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			return authorizationHeader.substring(7); // "Bearer " 이후의 값 추출
		} else return null;
	}
}
