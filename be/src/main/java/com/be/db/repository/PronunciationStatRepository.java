package com.be.db.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationStat;

public interface PronunciationStatRepository extends JpaRepository<PronunciationStat, Long> {

	Optional<PronunciationStat> findByUser_IdAndPronunciationClass_Id(Long userId, Long classId);

	boolean existsByUser_IdAndPronunciationClass_Id(Long userId, Long classId);
}
