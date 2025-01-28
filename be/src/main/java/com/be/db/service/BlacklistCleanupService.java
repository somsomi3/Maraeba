package com.be.db.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.be.db.repository.AccessTokenBlacklistRepository;

@Service
public class BlacklistCleanupService {
	private final AccessTokenBlacklistRepository accessTokenBlacklistRepository;

	public BlacklistCleanupService(AccessTokenBlacklistRepository accessTokenBlacklistRepository) {
		this.accessTokenBlacklistRepository = accessTokenBlacklistRepository;
	}

	@Scheduled(cron = "0 0 0 * * ?")
	public void cleanupExpiredTokens() {
		accessTokenBlacklistRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
	}

}
