package com.be.domain.prons.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationClassHistoryDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationHistoryDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.dto.PronunciationStatDTO;

public interface PronsService {
	/**
	 * 수업 리스트 반환
	 * @return response
	 */
	List<PronunciationClassDTO> getClasses();

	/**
	 * 특정 수업 발음 자료 반환
	 * @param classId
	 * @return response
	 */
	List<PronunciationDataDTO> getClassData(Long classId);

	/**
	 * 특정 수업 특정 발음 자료 반환
	 * @param classId
	 * @param sequence
	 * @return
	 */
	PronunciationDataDTO getSpecificData(Long classId, Integer sequence);

	/**
	 * 수업 세션 생성
	 * @param session
	 */
	void saveSession(PronunciationSessionDTO session);

	/**
	 * 수업 세션 가져오기
	 * @param id
	 * @return
	 */
	PronunciationSessionDTO getSession(String id);

	/**
	 * 수업 세션 삭제
	 * @param id
	 */
	void deleteSession(String id);

	/**
	 * 발음 정답 여부 저장
	 * @param id
	 * @param isCorrect
	 */
	void savePronunciationSimilarity(String id, Long pronId, Integer isCorrect);

	/**
	 * 히스토리 저장
	 * @param id
	 */
	void saveSessionHistory(String id);

	/**
	 * 히스토리 조회
	 * @param id
	 * @return
	 */
	Page<PronunciationHistoryDTO> getHistories(Long id, int page, int size);

	/**
	 * 통계 조회
	 * @param id
	 * @return
	 */
	List<PronunciationStatDTO> getStats(Long id);

	/**
	 * 특정 클래스 최신 히스토리 10개 조회
	 * @param classId
	 * @return
	 */
	List<PronunciationClassHistoryDTO> getClassHistory(Long id, Long classId);
}
