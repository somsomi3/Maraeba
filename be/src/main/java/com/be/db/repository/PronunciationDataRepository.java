package com.be.db.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationData;
import com.be.domain.prons.dto.PronunciationDataDTO;

public interface PronunciationDataRepository extends JpaRepository<PronunciationData, Long> {
	List<PronunciationDataDTO> findByPronunciationClassIdOrderBySequenceAsc(Long classId);

	Optional<PronunciationDataDTO> findByPronunciationClassIdAndSequence(Long classId, Integer sequence);
}
