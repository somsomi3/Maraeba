package com.be.db.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.be.db.entity.PronunciationHistory;
import com.be.domain.prons.dto.PronunciationClassHistoryDTO;
import com.be.domain.prons.dto.PronunciationHistoryDTO;

import io.lettuce.core.dynamic.annotation.Param;

public interface PronunciationHistoryRepository extends JpaRepository<PronunciationHistory, Long> {
	@Query("SELECT new com.be.domain.prons.dto.PronunciationHistoryDTO(ph.pronunciationClass.id, ph.averageCorrectRate, ph.createdAt) FROM PronunciationHistory ph WHERE ph.user.id = :userId")
	Page<PronunciationHistoryDTO> findByUser_Id(@Param("userId") Long userId, Pageable pageable);

	@Query("SELECT new com.be.domain.prons.dto.PronunciationClassHistoryDTO(ph.averageCorrectRate, ph.createdAt) " +
		"FROM PronunciationHistory ph " +
		"WHERE ph.user.id = :userId AND ph.pronunciationClass.id = :classId " +
		"ORDER BY ph.createdAt DESC")
	List<PronunciationClassHistoryDTO> findByClassId(
		@Param("userId") Long userId,
		@Param("classId") Long classId
	);
}
