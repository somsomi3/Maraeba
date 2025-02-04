package com.be.db.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "webrtc_log") // ✅ 테이블 이름을 명확히 지정
public class WebRTCLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonProperty("call_id")
	private String callId;  // ✅ UUID 또는 문자열 저장

	@JsonProperty("user_id")
	private Long userId;

	@JsonProperty("start_time")
	private long startTime;

	@JsonProperty("end_time")
	private long endTime;

	@JsonProperty("packet_loss")
	private double packetLoss;

	private double jitter;
	private double latency;
	private double bitrate;

	// ✅ 올바르게 필드 값을 설정하는 생성자 추가
	public WebRTCLog(String callId, Long userId, long startTime, long endTime, double packetLoss, double jitter, double latency, double bitrate) {
		this.callId = callId;
		this.userId = userId;
		this.startTime = startTime;
		this.endTime = endTime;
		this.packetLoss = packetLoss;
		this.jitter = jitter;
		this.latency = latency;
		this.bitrate = bitrate;
	}

	public WebRTCLog(String callId, String authenticatedUserId, Long startTime, Long endTime, Double packetLoss, Double jitter, Double latency, Double bitrate) {
	}
}
