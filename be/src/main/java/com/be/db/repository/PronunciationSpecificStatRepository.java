package com.be.db.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.be.db.entity.PronunciationSpecificStat;
import com.be.domain.prons.dto.PronunciationDetailStatDTO;

public interface PronunciationSpecificStatRepository extends JpaRepository<PronunciationSpecificStat, Long> {

	boolean existsByUser_IdAndPronunciationData_Id(Long userId, Long pronId);

	Optional<PronunciationSpecificStat> findByUser_IdAndPronunciationData_Id(Long userId, Long pronId);

	@Query("SELECT new com.be.domain.prons.dto.PronunciationDetailStatDTO(" +
		"pd.pronunciation, pss.averageCorrectRate, pss.count) " +
		"FROM PronunciationSpecificStat pss " +
		"JOIN pss.user u " +
		"JOIN pss.pronunciationData pd " +
		"JOIN pd.pronunciationClass pc " +
		"WHERE u.id = :userId AND pc.id = :classId " +
		"ORDER BY pd.sequence ASC")
	List<PronunciationDetailStatDTO> findPronunciationStatsByUserIdAndClassId(
		@Param("userId") Long userId,
		@Param("classId") Long classId
	);
}
