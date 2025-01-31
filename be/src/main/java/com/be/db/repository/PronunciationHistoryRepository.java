package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationHistory;

public interface PronunciationHistoryRepository extends JpaRepository<PronunciationHistory, Long> {
}
