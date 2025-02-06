package com.be.db.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import com.be.db.entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
	Optional<RefreshToken> findByUserId(long id);

	@Modifying
	void deleteByUserId(Long id);

	void deleteAllByExpiryDateBefore(LocalDateTime expiryDateBefore);
}
