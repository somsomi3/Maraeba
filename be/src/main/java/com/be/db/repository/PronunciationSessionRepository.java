package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationSession;

public interface PronunciationSessionRepository extends JpaRepository<PronunciationSession, Long> {
}
