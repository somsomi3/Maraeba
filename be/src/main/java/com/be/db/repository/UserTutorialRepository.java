package com.be.db.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.UserTutorial;

public interface UserTutorialRepository extends JpaRepository<UserTutorial, Long> {
	Optional<UserTutorial> findByUser_Id(Long id);
}
