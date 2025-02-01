package com.be.domain.rooms.service;

import org.springframework.stereotype.Service;

import com.be.db.entity.WebRTCLog;
import com.be.db.repository.WebRTCLogRepository;
import com.be.domain.rooms.WebRTCLogDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebRTCLogService {
	private final WebRTCLogRepository webRTCLogRepository;

	public void saveCallLog(WebRTCLogDto logDto) {
		WebRTCLog log = new WebRTCLog(
			null,
			logDto.getCallId(),
			logDto.getUserId(),
			logDto.getStartTime(),
			logDto.getEndTime(),
			logDto.getPacketLoss(),
			logDto.getJitter(),
			logDto.getLatency(),
			logDto.getBitrate()
		);
		webRTCLogRepository.save(log);
	}
}
