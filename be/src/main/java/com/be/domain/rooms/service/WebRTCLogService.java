package com.be.domain.rooms.service;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.repository.UserRepository;
import com.be.domain.rooms.request.SaveCallLogRequest;
import org.springframework.stereotype.Service;

import com.be.db.entity.WebRTCLog;
import com.be.db.repository.WebRTCLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebRTCLogService {

	private final WebRTCLogRepository webRTCLogRepository;
	private final UserRepository userRepository;

	public void saveCallLog(SaveCallLogRequest request) {
		WebRTCLog webRTCLog = new WebRTCLog();
		webRTCLog.setUser(userRepository.findById(request.getUserId()).orElseThrow(()->new CustomException(ErrorCode.USER_NOT_FOUND)));
		webRTCLog.setStartTime(request.getStartTime());
		webRTCLog.setEndTime(request.getEndTime());
		webRTCLogRepository.save(webRTCLog);
	}
}
