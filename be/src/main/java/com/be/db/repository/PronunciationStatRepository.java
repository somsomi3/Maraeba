package com.be.db.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.be.db.entity.PronunciationStat;
import com.be.domain.prons.dto.PronunciationStatDTO;

public interface PronunciationStatRepository extends JpaRepository<PronunciationStat, Long> {

	Optional<PronunciationStat> findByUser_IdAndPronunciationClass_Id(Long userId, Long classId);

	boolean existsByUser_IdAndPronunciationClass_Id(Long userId, Long classId);

	@Query(
		"SELECT new com.be.domain.prons.dto.PronunciationStatDTO(ps.pronunciationClass.id, ps.averageCorrectRate, ps.count) "
			+
			"FROM PronunciationStat ps " +
			"WHERE ps.user.id = :userId " +
			"ORDER BY ps.pronunciationClass.id ASC")
	List<PronunciationStatDTO> findByUser_Id(@Param("userId") Long userId);
}
