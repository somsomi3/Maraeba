package com.be.domain.prons.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.PronunciationClass;
import com.be.db.entity.PronunciationHistory;
import com.be.db.entity.User;
import com.be.db.repository.PronunciationClassRepository;
import com.be.db.repository.PronunciationDataRepository;
import com.be.db.repository.PronunciationHistoryRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PronsServiceImpl implements PronsService {

	private final UserRepository userRepository;
	private final PronunciationClassRepository pronunciationClassRepository;
	private final PronunciationDataRepository pronunciationDataRepository;
	private final PronunciationHistoryRepository pronunciationHistoryRepository;
	private final RedisTemplate<String, PronunciationSessionDTO> redisTemplate;

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
			sequence).orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));
		return dataDTO;
	}

	// 수업 세션 생성
	@Override
	public void saveSession(PronunciationSessionDTO session) {
		ValueOperations<String, PronunciationSessionDTO> ops = redisTemplate.opsForValue();
		ops.set(session.getId(), session, Duration.ofHours(1)); // 1시간 유지
	}

	// 수업 세션 조회
	@Override
	public PronunciationSessionDTO getSession(String id) {
		ValueOperations<String, PronunciationSessionDTO> ops = redisTemplate.opsForValue();
		return ops.get(id);
	}

	// 수업 세션 삭제
	@Override
	public void deleteSession(String id) {
		redisTemplate.delete(id);
	}

	// 세션에 발음 유사도 저장
	@Override
	public void savePronunciationSimilarity(String id, double similarity) {
		PronunciationSessionDTO session = redisTemplate.opsForValue().get(id);

		if (session != null) {
			session.getSimilarities().add(similarity); // 유사도 저장
			session.setProgress(session.getProgress() + 1); // 진행 개수 증가
			redisTemplate.opsForValue().set(id, session); // 업데이트
		}
	}

	// 히스토리 저장
	@Override
	public void saveSessionHistory(String id) {
		double avgSimilarity = calculateAverageSimilarity(id);
		PronunciationSessionDTO session = getSession(id);

		if (session != null) {
			User user = userRepository.findUserById(session.getUserId())
				.orElseThrow(() ->new CustomException(ErrorCode.USER_NOT_FOUND));
			PronunciationClass pronunciationClass = pronunciationClassRepository.findPronunciationClassById(
				session.getClassId()).orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

			PronunciationHistory statistics = new PronunciationHistory(
				session.getId(),
				user,
				pronunciationClass,
				avgSimilarity
			);
			pronunciationHistoryRepository.save(statistics);
		}
	}

	// 평균 정확도 계산
	public double calculateAverageSimilarity(String id) {
		PronunciationSessionDTO session = redisTemplate.opsForValue().get(id);

		if (session != null && !session.getSimilarities().isEmpty()) {
			double sum = session.getSimilarities().stream().mapToDouble(Double::doubleValue).sum();
			return sum / session.getSimilarities().size();
		}
		return 0.0; // 유사도 데이터가 없을 경우 0 반환
	}
}
