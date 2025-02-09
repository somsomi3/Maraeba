package com.be.domain.rooms.controller;

import java.util.List;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.rooms.request.SaveCallLogRequest;
import com.be.domain.rooms.service.WebRTCLogService;
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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/webrtc")
@RequiredArgsConstructor
public class WebRTCLogController {

	private final WebRTCLogRepository webRTCLogRepository;
	private final WebRTCLogService webRTCLogService;


	// ✅ 모든 로그 조회 (GET 요청 허용)
	@GetMapping("/logs")
	public ResponseEntity<List<WebRTCLog>> getAllCallLogs(
		@RequestParam(required = false) Long userId,
		@RequestParam(required = false) String roomId) { // ✅ 쿼리 파라미터 추가

		log.info("📌 요청된 userId: {}", userId);
		log.info("📌 요청된 roomId: {}", roomId);


		List<WebRTCLog> logs;
		if (userId != null) {
			logs = webRTCLogRepository.findByUserId((userId)); // ✅ 특정 유저 로그 조회

		} else {
			logs = webRTCLogRepository.findAll(); // ✅ 모든 로그 조회
		}

		return ResponseEntity.ok(logs);
	}

	@PostMapping("/logs")
	public ResponseEntity<? extends BaseResponseBody> saveCallLog(@RequestBody(required = false)SaveCallLogRequest request,
																  @AuthenticationPrincipal UserDetails userDetails) {
		if (request == null) {
			return ResponseEntity.badRequest().body(BaseResponseBody.of("❌ 잘못된 요청: 요청 본문이 없음",400));
		}
		log.info("Received WebRTC Log: {}", request);
		Long userId = (userDetails != null) ? Long.parseLong(userDetails.getUsername()) : null;
		request.setUserId(userId);
		webRTCLogService.saveCallLog(request);
		return ResponseEntity.ok().body(BaseResponseBody.of("✅ 로그 저장 완료 (비로그인 허용)",200));
	}

}