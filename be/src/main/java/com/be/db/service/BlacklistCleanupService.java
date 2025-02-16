package com.be.db.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.db.repository.AccessTokenBlacklistRepository;
import com.be.db.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlacklistCleanupService {
	private final AccessTokenBlacklistRepository accessTokenBlacklistRepository;
	private final RefreshTokenRepository refreshTokenRepository;

	@Scheduled(cron = "0 0 0 * * ?")
	@Transactional
	public void cleanupExpiredTokens() {
		accessTokenBlacklistRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
		refreshTokenRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
	}

}
