package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationRecord;

public interface PronunciationRecordRepository extends JpaRepository<PronunciationRecord, Long> {
}
