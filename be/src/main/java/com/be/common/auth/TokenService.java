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

@Service
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

	public TokenService(AccessTokenBlacklistRepository accessTokenBlacklistRepository) {
		this.accessTokenBlacklistRepository = accessTokenBlacklistRepository;
	}

	public String generateToken(Long id, TokenType type) {
		long expirationTime = selectExpirationTime(type);
		return Jwts.builder()
			.subject(String.valueOf(id))
			.issuedAt(new Date())
			.expiration(new Date(System.currentTimeMillis() + expirationTime))
			.signWith(key)
			.compact();
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token);
			return true;
		} catch (JwtException e) {
			return false;
		}
	}

	public void addToBlacklist(String token) {
		Date expiration = getExpirationDate(token);
		if (expiration != null) {
			AccessTokenBlacklist accessTokenBlacklist = new AccessTokenBlacklist();
			accessTokenBlacklist.setToken(token);
			accessTokenBlacklist.setExpiryDate(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
			accessTokenBlacklistRepository.save(accessTokenBlacklist);
		}
	}

	public boolean isBlacklisted(String token) {
		return accessTokenBlacklistRepository.existsByToken(token);
	}

	private long selectExpirationTime(TokenType type) {
		return type == TokenType.ACCESS_TOKEN ? accessTokenValiditySeconds : refreshTokenValiditySeconds;
	}

	private Date getExpirationDate(String token) {
		try {
			return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getExpiration();
		} catch (ExpiredJwtException e) {
			return null;
		} catch (JwtException e) {
			throw new IllegalArgumentException("Invalid token", e);
		}
	}
}
