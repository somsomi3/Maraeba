package com.be.db.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.be.db.entity.PronunciationHistory;
import com.be.domain.prons.dto.PronunciationHistoryDTO;

import io.lettuce.core.dynamic.annotation.Param;

public interface PronunciationHistoryRepository extends JpaRepository<PronunciationHistory, Long> {
	int countByUser_IdAndPronunciationClass_Id(Long userId, Long classId);

	@Query("SELECT new com.be.domain.prons.dto.PronunciationHistoryDTO(ph.pronunciationClass.id, ph.averageSimilarity, ph.createdAt) FROM PronunciationHistory ph WHERE ph.user.id = :userId")
	List<PronunciationHistoryDTO> findByUser_Id(@Param("userId") Long userId);
}
