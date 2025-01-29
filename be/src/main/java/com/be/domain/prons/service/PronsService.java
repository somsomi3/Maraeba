package com.be.domain.prons.service;

import java.util.List;

import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;

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
}
