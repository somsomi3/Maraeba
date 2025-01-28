package com.be.db.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.AccessTokenBlacklist;

public interface AccessTokenBlacklistRepository extends JpaRepository<AccessTokenBlacklist, Long> {
	boolean existsByToken(String token);

	void deleteAllByExpiryDateBefore(LocalDateTime now);
}
