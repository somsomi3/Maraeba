package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationClass;

public interface PronunciationClassRepository extends JpaRepository<PronunciationClass, Long> {
	
}
