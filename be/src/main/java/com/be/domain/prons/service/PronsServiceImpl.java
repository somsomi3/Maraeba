package com.be.domain.prons.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.PronunciationClass;
import com.be.db.entity.PronunciationHistory;
import com.be.db.entity.PronunciationSpecificStat;
import com.be.db.entity.PronunciationStat;
import com.be.db.entity.User;
import com.be.db.repository.PronunciationClassRepository;
import com.be.db.repository.PronunciationDataRepository;
import com.be.db.repository.PronunciationHistoryRepository;
import com.be.db.repository.PronunciationSpecificStatRepository;
import com.be.db.repository.PronunciationStatRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationClassHistoryDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationDetailStatDTO;
import com.be.domain.prons.dto.PronunciationHistoryDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.dto.PronunciationStatDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PronsServiceImpl implements PronsService {

	private final UserRepository userRepository;
	private final PronunciationClassRepository pronunciationClassRepository;
	private final PronunciationDataRepository pronunciationDataRepository;
	private final PronunciationHistoryRepository pronunciationHistoryRepository;
	private final PronunciationStatRepository pronunciationStatRepository;
	private final RedisTemplate<String, PronunciationSessionDTO> redisTemplate;
	private final PronunciationSpecificStatRepository pronunciationSpecificStatRepository;

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
	@Transactional
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
	@Transactional
	@Override
	public void deleteSession(String id) {
		redisTemplate.delete(id);
	}

	// 세션에 발음 정답 여부 저장
	@Transactional
	@Override
	public void savePronunciationSimilarity(String id, Long pronId, Integer isCorrect) {
		PronunciationSessionDTO session = redisTemplate.opsForValue().get(id);

		// 세션을 찾았다면
		if (session != null) {
			session.setTryCount(session.getTryCount() + 1);    // 시도 횟수 1 증가
			session.setCorrectCount(session.getCorrectCount() + isCorrect); // 정답 여부 저장
			session.getCorrectMap().put(pronId, isCorrect);    // 특정 발음 정답 여부 저장
			redisTemplate.opsForValue().set(id, session); // 업데이트
		}
	}

	// 히스토리 저장
	@Transactional
	@Override
	public void saveSessionHistory(String id) {
		// 평균 정확도 계산하기
		double avgCorrectRate = calculateAverageCorrectRate(id);
		PronunciationSessionDTO session = getSession(id);

		// 세션을 찾았다면 정보 저장
		if (session != null) {
			// 사용자 객체
			User user = userRepository.findById(session.getUserId())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

			// 수업 객체
			PronunciationClass pronunciationClass = pronunciationClassRepository.findPronunciationClassById(
				session.getClassId()).orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

			// 히스토리 객체 저장
			PronunciationHistory history = new PronunciationHistory(
				session.getId(),
				user,
				pronunciationClass,
				avgCorrectRate
			);

			pronunciationHistoryRepository.save(history);

			// 여기서부터 통계 업데이트
			// stat이 존재하지 않는다면 새로 만들기
			if (!pronunciationStatRepository.existsByUser_IdAndPronunciationClass_Id(session.getUserId(),
				session.getClassId())) {
				PronunciationStat newStat = new PronunciationStat();
				newStat.setUser(user);
				newStat.setPronunciationClass(pronunciationClass);
				newStat.setAverageCorrectRate(0f); // 첫 값 설정
				newStat.setCount(0);
				pronunciationStatRepository.save(newStat);
			}

			// 통계 정보 업데이트
			PronunciationStat stat = pronunciationStatRepository.findByUser_IdAndPronunciationClass_Id(
				session.getUserId(),
				session.getClassId()).orElseThrow(() -> new CustomException(ErrorCode.STAT_NOT_FOUND));
			stat.setAverageCorrectRate(
				(float)(stat.getAverageCorrectRate() + (avgCorrectRate - stat.getAverageCorrectRate()) / (
					stat.getCount() + 1)));
			stat.setCount(stat.getCount() + 1);
			pronunciationStatRepository.save(stat);

			// 특정 발음 정답률 갱신
			for (Long pronId : session.getCorrectMap().keySet()) {
				// 없으면 만들기
				if (!pronunciationSpecificStatRepository.existsByUser_IdAndPronunciationData_Id(session.getUserId(),
					pronId)) {
					PronunciationSpecificStat specificStat = PronunciationSpecificStat.builder()
						.user(user)
						.pronunciationData(pronunciationDataRepository.getReferenceById(pronId))
						.averageCorrectRate(0f)
						.count(0)
						.build();
					pronunciationSpecificStatRepository.save(specificStat);
				}

				PronunciationSpecificStat specificStat = pronunciationSpecificStatRepository.findByUser_IdAndPronunciationData_Id(
					session.getUserId(), pronId).orElseThrow(() -> new CustomException(ErrorCode.STAT_NOT_FOUND));
				specificStat.setAverageCorrectRate(
					specificStat.getAverageCorrectRate()
						+ (session.getCorrectMap().get(pronId) - specificStat.getAverageCorrectRate()) / (
						specificStat.getCount() + 1));
				specificStat.setCount(specificStat.getCount() + 1);
				pronunciationSpecificStatRepository.save(specificStat);

			}
		}
	}

	// 히스토리 조회
	@Override
	public Page<PronunciationHistoryDTO> getHistories(Long id, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return pronunciationHistoryRepository.findByUser_Id(id, pageable);
	}

	// 통계 조회
	@Override
	public List<PronunciationStatDTO> getStats(Long id) {
		List<PronunciationStatDTO> statDTOs = pronunciationStatRepository.findByUser_Id(id);
		return statDTOs;
	}

	// 특정 클래스 최신 히스토리 10개 조회
	@Override
	public List<PronunciationClassHistoryDTO> getClassHistory(Long id, Long classId) {
		return pronunciationHistoryRepository.findByClassId(id, classId)
			.stream()
			.limit(10)  // 최신 10개 제한
			.toList();
	}

	// 특정 클래스 자세한 통계 조회
	@Override
	public List<PronunciationDetailStatDTO> getStatDetail(Long id, Long classId) {
		List<PronunciationDetailStatDTO> statDTOS = pronunciationSpecificStatRepository.findPronunciationStatsByUserIdAndClassId(
			id, classId);
		return statDTOS;
	}

	// 평균 정확도 계산
	public double calculateAverageCorrectRate(String id) {
		PronunciationSessionDTO session = redisTemplate.opsForValue().get(id);

		// 세션이 존재하고 시도 횟수가 0보다 크면
		if (session != null && session.getTryCount() > 0) {
			double sum = session.getCorrectCount();
			return sum / session.getTryCount();
		}
		return 0.0; // 시도 횟수가 없을 경우 0 반환
	}
}
