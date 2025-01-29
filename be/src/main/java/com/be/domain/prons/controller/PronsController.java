package com.be.domain.prons.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.domain.prons.dto.PronunciationClassDTO;
import com.be.domain.prons.dto.PronunciationDataDTO;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import com.be.domain.prons.request.PostSessionReq;
import com.be.domain.prons.request.PostSimilarityReq;
import com.be.domain.prons.response.GetClassDataRes;
import com.be.domain.prons.response.GetClassesRes;
import com.be.domain.prons.response.GetSpecificDataRes;
import com.be.domain.prons.service.PronsService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/prons")
public class PronsController {

	private final PronsService pronsService;

	// 발음 수업 카테고리 가져오기
	@GetMapping
	public GetClassesRes getClasses() {
		List<PronunciationClassDTO> classDTOS = pronsService.getClasses();
		return new GetClassesRes("Success", 200, classDTOS);
	}

	// 특정 수업 학습자료 가져오기
	@GetMapping("/class/{class_id}")
	public GetClassDataRes getClassData(@NotBlank @PathVariable("class_id") Long classId) {
		List<PronunciationDataDTO> dataDTOS = pronsService.getClassData(classId);
		return new GetClassDataRes("Success", 200, dataDTOS);
	}

	// 특정 수업 특정 발음 자료 가져오기
	@GetMapping("/class/{class_id}/seq/{seq_id}")
	public GetSpecificDataRes getSpecificData(@NotBlank @PathVariable("class_id") Long classId,
		@PathVariable("seq_id") Integer sequence) {
		PronunciationDataDTO dataDTO = pronsService.getSpecificData(classId, sequence);
		return new GetSpecificDataRes("Success", 200, dataDTO);
	}

	// 수업 세션 생성 (사용자가 수업 시작)
	@PostMapping("/start")
	public String startSession(@Validated @RequestBody PostSessionReq request) {
		String id = UUID.randomUUID().toString(); // 세션 ID 생성
		PronunciationSessionDTO session = new PronunciationSessionDTO(id, request.getUserId(), request.getClassId(), 0);
		pronsService.saveSession(session);
		return id; // 클라이언트가 세션 ID를 저장
	}

	// 세션 조회
	@GetMapping("/session/{session_id}")
	public PronunciationSessionDTO getLessonSession(@NotBlank @PathVariable("session_id") String id) {
		return pronsService.getSession(id);
	}

	// 세션 삭제 (수업 종료)
	@DeleteMapping("/session/{session_id}")
	public String endLesson(@NotBlank @PathVariable("session_id") String id) {
		pronsService.deleteSession(id);
		return "Session ended";
	}

	// 발음 유사도 저장 (사용자가 발음을 녹음하면 실행)
	@PostMapping("/session/similarity")
	public ResponseEntity<String> savePronunciationSimilarity(@Validated @RequestBody PostSimilarityReq request) {
		pronsService.savePronunciationSimilarity(request.getSessionId(), request.getSimilarity());
		return ResponseEntity.ok("Similarity saved");
	}

	// 히스토리 및 통계 저장
	@PostMapping("/session/history/{session_id}")
	public ResponseEntity<String> saveSessionHistory(@NotBlank @PathVariable("session_id") String id) {
		pronsService.saveSessionHistory(id);
		return ResponseEntity.ok("History saved");
	}

}
