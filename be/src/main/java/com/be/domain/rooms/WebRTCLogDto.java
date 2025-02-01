package com.be.domain.rooms;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebRTCLogDto {
	@JsonProperty("call_id")
	private String callId;

	@JsonProperty("user_id")
	private Long userId;

	@JsonProperty("start_time")
	private Long startTime;

	@JsonProperty("end_time")
	private Long endTime;

	@JsonProperty("packet_loss")
	private Double packetLoss;

	@JsonProperty("jitter")
	private Double jitter;

	@JsonProperty("latency")
	private Double latency;

	@JsonProperty("bitrate")
	private Double bitrate;
}