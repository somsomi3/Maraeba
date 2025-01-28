package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationData;

public interface PronunciationDataRepository extends JpaRepository<PronunciationData, Long> {
}
