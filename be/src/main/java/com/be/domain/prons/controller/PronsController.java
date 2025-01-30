package com.be.domain.prons.controller;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.request.PostSessionReq;
import com.be.domain.prons.request.PostSimilarityReq;
import com.be.domain.prons.response.GetClassDataRes;
import com.be.domain.prons.response.GetClassesRes;
import com.be.domain.prons.response.GetSessionRes;
import com.be.domain.prons.response.GetSpecificDataRes;
import com.be.domain.prons.response.PostSessionRes;
import com.be.domain.prons.service.PronsService;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/prons")
public class PronsController {

	private final PronsService pronsService;

	// 발음 수업 카테고리 가져오기
	@GetMapping
	public GetClassesRes getClasses() {
		List<PronunciationClassDTO> classDTOS = pronsService.getClasses();
		return new GetClassesRes("Success", HttpStatus.OK, classDTOS);
	}

	// 특정 수업 학습자료 가져오기
	@GetMapping("/class/{class_id}")
	public GetClassDataRes getClassData(@NotBlank @PathVariable("class_id") Long classId) {
		List<PronunciationDataDTO> dataDTOS = pronsService.getClassData(classId);
		return new GetClassDataRes("Success", HttpStatus.OK, dataDTOS);
	}

	// 특정 수업 특정 발음 자료 가져오기
	@GetMapping("/class/{class_id}/seq/{seq_id}")
	public GetSpecificDataRes getSpecificData(@NotBlank @PathVariable("class_id") Long classId,
		@PathVariable("seq_id") Integer sequence) {
		PronunciationDataDTO dataDTO = pronsService.getSpecificData(classId, sequence);
		return new GetSpecificDataRes("Success", HttpStatus.OK, dataDTO);
	}

	// 수업 세션 생성 (사용자가 수업 시작)
	@PostMapping("/start")
	public PostSessionRes startSession(@Validated @RequestBody PostSessionReq request) {
		String id = UUID.randomUUID().toString(); // 세션 ID 생성
		PronunciationSessionDTO session = new PronunciationSessionDTO(id, request.getUserId(), request.getClassId(), 0);
		pronsService.saveSession(session);
		return new PostSessionRes("Success", HttpStatus.CREATED, id); // 클라이언트가 세션 ID를 저장
	}

	// 세션 조회
	@GetMapping("/session/{session_id}")
	public GetSessionRes getLessonSession(@NotBlank @PathVariable("session_id") String id) {
		PronunciationSessionDTO sessionDTO = pronsService.getSession(id);
		if(sessionDTO == null) {
			throw new CustomException(ErrorCode.SESSION_NOT_FOUND);
		}
		return new GetSessionRes("Success", HttpStatus.OK, sessionDTO);
	}

	// 세션 삭제 (수업 종료)
	@DeleteMapping("/session/{session_id}")
	public BaseResponseBody endLesson(@NotBlank @PathVariable("session_id") String id) {
		pronsService.deleteSession(id);
		return new BaseResponseBody("Session ended", HttpStatus.NO_CONTENT);
	}

	// 발음 유사도 저장
	@PostMapping("/session/similarity")
	public BaseResponseBody savePronunciationSimilarity(@Validated @RequestBody PostSimilarityReq request) {
		pronsService.savePronunciationSimilarity(request.getSessionId(), request.getSimilarity());
		return new BaseResponseBody("Similarity saved", HttpStatus.CREATED);
	}

	// 히스토리 및 통계 저장
	@PostMapping("/session/history/{session_id}")
	public BaseResponseBody saveSessionHistory(@NotBlank @PathVariable("session_id") String id) {
		pronsService.saveSessionHistory(id);
		return new BaseResponseBody("History saved", HttpStatus.CREATED);
	}

}
