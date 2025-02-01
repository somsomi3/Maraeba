package com.be.domain.rooms.controller;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.be.db.entity.WebRTCLog;
import com.be.db.repository.WebRTCLogRepository;
import com.be.domain.rooms.WebRTCLogDto;
import com.be.domain.rooms.service.WebRTCLogService;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/webrtc")
@RequiredArgsConstructor
public class WebRTCLogController {

	private final WebRTCLogRepository webRTCLogRepository;

	// ✅ 모든 로그 조회 (GET 요청 허용)
	@GetMapping("/logs")
	public ResponseEntity<List<WebRTCLog>> getAllCallLogs(
		@RequestParam(required = false) Long userId,
		@RequestParam(required = false) String callId) { // ✅ 쿼리 파라미터 추가

		System.out.println("📌 요청된 userId: " + userId);
		System.out.println("📌 요청된 callId: " + callId);

		List<WebRTCLog> logs;
		if (userId != null) {
			logs = webRTCLogRepository.findByUserId((userId)); // ✅ 특정 유저 로그 조회
		} else if (callId != null) {
			logs = webRTCLogRepository.findByCallId(callId); // ✅ 특정 통화 로그 조회
		} else {
			logs = webRTCLogRepository.findAll(); // ✅ 모든 로그 조회
		}

		return ResponseEntity.ok(logs);
	}

	@PostMapping("/logs")
	public ResponseEntity<String> saveCallLog(@RequestBody(required = false) WebRTCLogDto logDto,
		@AuthenticationPrincipal UserDetails userDetails) {
		if (logDto == null) {
			return ResponseEntity.badRequest().body("❌ 잘못된 요청: 요청 본문이 없음");
		}

		// ✅ 로그인한 경우 userId 설정, 로그인 안 한 경우 null
		Long userId = (userDetails != null) ? Long.parseLong(userDetails.getUsername()) : null;

		// ✅ WebRTCLog 객체 생성
		WebRTCLog log = new WebRTCLog(
			logDto.getCallId(),
			userId,  // 로그인한 경우 userId 저장, 비로그인 사용자는 null
			logDto.getStartTime(),
			logDto.getEndTime(),
			logDto.getPacketLoss(),
			logDto.getJitter(),
			logDto.getLatency(),
			logDto.getBitrate()
		);

		// ✅ 로그 저장
		webRTCLogRepository.save(log);

		return ResponseEntity.ok("✅ 로그 저장 완료 (비로그인 허용)");
	}

}