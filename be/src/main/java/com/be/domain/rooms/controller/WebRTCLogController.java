package com.be.domain.rooms.controller;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.rooms.request.SaveCallLogRequest;
import com.be.domain.rooms.service.WebRTCLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/webrtcs")
@RequiredArgsConstructor
public class WebRTCLogController {

	private final WebRTCLogService webRTCLogService;

	// 로그 저장
	@PostMapping("/log")
	public ResponseEntity<? extends BaseResponseBody> saveCallLog(@RequestBody(required = false)SaveCallLogRequest request,
																  @AuthenticationPrincipal UserDetails userDetails) {
		if (request == null) {
			return ResponseEntity.badRequest().body(BaseResponseBody.of("잘못된 요청: 요청 본문이 없음",400));
		}
		log.info("Received WebRTC Log: {}", request);
		Long userId = (userDetails != null) ? Long.parseLong(userDetails.getUsername()) : null;
		request.setUserId(userId);
		webRTCLogService.saveCallLog(request);
		return ResponseEntity.ok().body(BaseResponseBody.of("로그 저장 완료 (비로그인 허용)",200));
	}

}