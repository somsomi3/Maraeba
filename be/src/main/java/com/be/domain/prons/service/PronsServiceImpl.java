package com.be.domain.prons.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.be.db.repository.PronunciationClassRepository;
import com.be.db.repository.PronunciationDataRepository;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PronsServiceImpl implements PronsService {

	private final PronunciationClassRepository pronunciationClassRepository;
	private final PronunciationDataRepository pronunciationDataRepository;

	// 수업 리스트 반환
	@Override
	public List<PronunciationClassDTO> getClasses() {
		List<PronunciationClassDTO> classDTOs = pronunciationClassRepository.findAllByOrderByIdAsc();
		return classDTOs;
	}

	// 특정 수업 발음 자료 반환
	@Override
	public List<PronunciationDataDTO> getClassData(Long classId) {
		List<PronunciationDataDTO> dataDTOS = pronunciationDataRepository.findByPronunciationClassIdOrderBySequenceAsc(
			classId);
		return dataDTOS;
	}

	// 특정 수업 특정 발음 자료 반환
	@Override
	public PronunciationDataDTO getSpecificData(Long classId, Integer sequence) {
		PronunciationDataDTO dataDTO = pronunciationDataRepository.findByPronunciationClassIdAndSequence(classId,
			sequence);
		return dataDTO;
	}
}
