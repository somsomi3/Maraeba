package com.be.db.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.be.db.entity.AccessTokenBlacklist;

@Repository
public interface AccessTokenBlacklistRepository extends JpaRepository<AccessTokenBlacklist, Long> {
	boolean existsByToken(String token);

	void deleteAllByExpiryDateBefore(LocalDateTime now);
}
