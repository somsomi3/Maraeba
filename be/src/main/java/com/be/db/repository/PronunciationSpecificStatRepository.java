package com.be.db.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationSpecificStat;

public interface PronunciationSpecificStatRepository extends JpaRepository<PronunciationSpecificStat, Long> {

	boolean existsByUser_IdAndPronunciationData_Id(Long userId, Long pronId);

	Optional<PronunciationSpecificStat> findByUser_IdAndPronunciationData_Id(Long userId, Long pronId);
}
