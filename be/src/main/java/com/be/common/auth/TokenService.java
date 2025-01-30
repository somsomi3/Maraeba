package com.be.common.auth;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.be.db.entity.AccessTokenBlacklist;
import com.be.db.repository.AccessTokenBlacklistRepository;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
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
	 * 토큰 유효 검사
	 */
	public boolean validateToken(String token) {
		try {
			if (isBlacklisted(token)) {
				return false;
			}
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
}
