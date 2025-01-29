package com.be.db.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.be.db.entity.PronunciationClass;
import com.be.domain.prons.dto.PronunciationClassDTO;

public interface PronunciationClassRepository extends JpaRepository<PronunciationClass, Long> {

	List<PronunciationClassDTO> findAllByOrderByIdAsc();
}
