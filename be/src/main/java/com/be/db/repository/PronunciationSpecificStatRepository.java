package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationSpecificStat;

public interface PronunciationSpecificStatRepository extends JpaRepository<PronunciationSpecificStat, Long> {
	
}
