package com.be.domain.prons.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.common.model.response.BaseResponseBody;
import com.be.common.model.response.PageResponse;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationHistoryDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.request.PostSimilarityReq;
import com.be.domain.prons.response.GetClassDataRes;
import com.be.domain.prons.response.GetClassesRes;
import com.be.domain.prons.response.GetHistoriesRes;
import com.be.domain.prons.response.GetSessionRes;
import com.be.domain.prons.response.GetSpecificDataRes;
import com.be.domain.prons.response.PostSessionRes;
import com.be.domain.prons.service.PronsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Tag(name = "PronsController", description = "발음 수업 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/prons")
public class PronsController {

	private final PronsService pronsService;

	// 발음 수업 카테고리 가져오기
	@Operation(summary = "발음 수업 카테고리 가져오기", description = "사용자가 접근할 수 있는 발음 수업 카테고리를 반환합니다.")
	@GetMapping
	public GetClassesRes getClasses() {
		List<PronunciationClassDTO> classDTOS = pronsService.getClasses();
		return new GetClassesRes("Success", HttpStatus.OK, classDTOS);
	}

	// 특정 수업 학습자료 가져오기
	@Operation(summary = "특정 수업 학습자료 가져오기", description = "특정 발음 수업의 학습 자료를 반환합니다.")
	@GetMapping("/class/{class_id}")
	public GetClassDataRes getClassData(@NotNull @PathVariable("class_id") Long classId) {
		List<PronunciationDataDTO> dataDTOS = pronsService.getClassData(classId);
		return new GetClassDataRes("Success", HttpStatus.OK, dataDTOS);
	}

	// 특정 수업 특정 발음 자료 가져오기
	@Operation(summary = "특정 수업 특정 발음 학습자료 가져오기", description = "특정 수업 특정 발음의 학습 자료를 반환합니다.")
	@GetMapping("/class/{class_id}/seq/{seq_id}")
	public GetSpecificDataRes getSpecificData(@NotNull @PathVariable("class_id") Long classId,
		@NotNull @PathVariable("seq_id") Integer sequence) {
		PronunciationDataDTO dataDTO = pronsService.getSpecificData(classId, sequence);
		return new GetSpecificDataRes("Success", HttpStatus.OK, dataDTO);
	}

	// 수업 세션 생성 (사용자가 수업 시작)
	@Operation(summary = "수업 세션 생성", description = "수업 세션을 시작합니다.")
	@PostMapping("/start/class/{class_id}")
	public PostSessionRes startSession(@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable("class_id") Long classId) {
		String id = UUID.randomUUID().toString(); // 세션 ID 생성
		PronunciationSessionDTO session = new PronunciationSessionDTO(id, Long.parseLong(userDetails.getUsername()),
			classId, 0);
		pronsService.saveSession(session);
		return new PostSessionRes("Success", HttpStatus.CREATED, id); // 클라이언트가 세션 ID를 저장
	}

	// 세션 조회
	@Operation(summary = "특정 세션 조회", description = "특정 세션의 정보를 가져옵니다.")
	@GetMapping("/session/{session_id}")
	public GetSessionRes getLessonSession(@NotBlank @PathVariable("session_id") String id) {
		PronunciationSessionDTO sessionDTO = pronsService.getSession(id);
		if (sessionDTO == null) {
			throw new CustomException(ErrorCode.SESSION_NOT_FOUND);
		}
		return new GetSessionRes("Success", HttpStatus.OK, sessionDTO);
	}

	// 세션 삭제 (수업 종료)
	@Operation(summary = "세션 종료", description = "수업 세션을 종료합니다.")
	@DeleteMapping("/session/{session_id}")
	public BaseResponseBody endLesson(@NotBlank @PathVariable("session_id") String id) {
		pronsService.deleteSession(id);
		return new BaseResponseBody("Session ended", HttpStatus.NO_CONTENT);
	}

	// 발음 유사도 저장
	@Operation(summary = "발음 유사도 저장", description = "발음 유사도를 저장합니다.")
	@PostMapping("/session/similarity")
	public BaseResponseBody savePronunciationSimilarity(@Validated @RequestBody PostSimilarityReq request) {
		pronsService.savePronunciationSimilarity(request.getSessionId(), request.getSimilarity());
		return new BaseResponseBody("Similarity saved", HttpStatus.CREATED);
	}

	// 히스토리 및 통계 저장
	@Operation(summary = "히스토리 및 통계 저장", description = "수업을 끝내기 전 히스토리와 통계를 저장합니다.")
	@PostMapping("/session/history/{session_id}")
	public BaseResponseBody saveSessionHistory(@NotBlank @PathVariable("session_id") String id) {
		pronsService.saveSessionHistory(id);
		return new BaseResponseBody("History saved", HttpStatus.CREATED);
	}

	// 히스토리 조회
	@Operation(summary = "히스토리 조회", description = "사용자 히스토리 조회")
	@GetMapping("/history")
	public GetHistoriesRes getHistories(@AuthenticationPrincipal UserDetails userDetails,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size) {
		Long id = Long.parseLong(userDetails.getUsername());

		// 히스토리 페이지 받기
		Page<PronunciationHistoryDTO> historyPage = pronsService.getHistories(id, page, size);

		// 필요한 형태로 변환
		PageResponse<PronunciationHistoryDTO> response = new PageResponse<>(
			historyPage.getContent(),
			historyPage.getTotalPages(),
			historyPage.getTotalElements(),
			historyPage.getSize(),
			historyPage.getNumber(),
			historyPage.isFirst(),
			historyPage.isLast()
		);
		return new GetHistoriesRes("Success", HttpStatus.OK, response);
	}
}
