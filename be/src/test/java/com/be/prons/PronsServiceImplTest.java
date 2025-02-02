package com.be.prons;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.ValueOperations;

import com.be.common.exception.CustomException;
import com.be.db.repository.PronunciationClassRepository;
import com.be.db.repository.PronunciationDataRepository;
import com.be.db.repository.PronunciationHistoryRepository;
import com.be.db.repository.PronunciationStatRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationHistoryDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.dto.PronunciationStatDTO;
import com.be.domain.prons.service.PronsServiceImpl;

@ExtendWith(MockitoExtension.class)
class PronsServiceImplTest {

	@Mock
	private UserRepository userRepository;
	@Mock
	private PronunciationClassRepository pronunciationClassRepository;
	@Mock
	private PronunciationDataRepository pronunciationDataRepository;
	@Mock
	private PronunciationHistoryRepository pronunciationHistoryRepository;
	@Mock
	private PronunciationStatRepository pronunciationStatRepository;
	@Mock
	private ValueOperations<String, PronunciationSessionDTO> valueOperations;

	@InjectMocks
	private PronsServiceImpl pronsService;

	private PronunciationSessionDTO mockSession;
	private PronunciationClassDTO mockClassDTO;
	private PronunciationDataDTO mockDataDTO;

	@BeforeEach
	void setup() {
		mockSession = new PronunciationSessionDTO("session1", 1L, 1L, 0);
		mockClassDTO = new PronunciationClassDTO(1L, "수업1", "설명1");
		mockDataDTO = new PronunciationDataDTO("발음1", "설명1", 1, "url", "url");
	}

	// 수업 목록 가져오기 테스트
	@Test
	void getClassesTest() {
		when(pronunciationClassRepository.findAllByOrderByIdAsc()).thenReturn(List.of(mockClassDTO));

		// when
		List<PronunciationClassDTO> result = pronsService.getClasses();

		// then
		assertNotNull(result);
		assertEquals(1, result.size());
		assertEquals("수업1", result.get(0).getTitle());
	}

	// 특정 수업의 발음 데이터 조회
	@Test
	void getClassDataTest() {
		when(pronunciationDataRepository.findByPronunciationClassIdOrderBySequenceAsc(1L))
			.thenReturn(List.of(mockDataDTO));

		List<PronunciationDataDTO> result = pronsService.getClassData(1L);

		assertEquals(1, result.size());
		assertEquals("발음1", result.get(0).getPronunciation());
	}

	// 특정 수업의 특정 발음 조회
	@Test
	void getSpecificDataTest() {
		when(pronunciationDataRepository.findByPronunciationClassIdAndSequence(1L, 1))
			.thenReturn(Optional.of(mockDataDTO));

		PronunciationDataDTO result = pronsService.getSpecificData(1L, 1);

		assertEquals("발음1", result.getPronunciation());
	}

	// 특정 수업 특정 발음 조회 실패 테스트
	@Test
	void getSpecificFailTest() {
		when(pronunciationDataRepository.findByPronunciationClassIdAndSequence(1L, 2))
			.thenReturn(Optional.empty());

		assertThrows(CustomException.class, () -> pronsService.getSpecificData(1L, 2));
	}

	// 히스토리 조회
	@Test
	void getHistoriesTest() {
		Page<PronunciationHistoryDTO> page = new PageImpl<>(
			List.of(new PronunciationHistoryDTO(1L, 88.5, LocalDateTime.now())));
		when(pronunciationHistoryRepository.findByUser_Id(eq(1L), any(PageRequest.class))).thenReturn(page);

		Page<PronunciationHistoryDTO> result = pronsService.getHistories(1L, 0, 10);

		assertEquals(1, result.getTotalElements());
	}

	// 통계 조회
	@Test
	void getStatsTest() {
		List<PronunciationStatDTO> stats = List.of(new PronunciationStatDTO(1L, 0.1f, 1));
		when(pronunciationStatRepository.findByUser_Id(1L)).thenReturn(stats);

		List<PronunciationStatDTO> result = pronsService.getStats(1L);

		assertEquals(1, result.size());
		assertEquals(0.1f, result.get(0).getAverageSimilarity());
	}
}
