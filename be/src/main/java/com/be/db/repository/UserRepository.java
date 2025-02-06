package com.be.db.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.be.db.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUserId(String userId);

	Optional<User> findByProviderAndProviderId(String provider, String providerId);

	List<User> findByEmail(String email);
}
