package com.be.domain.prons.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class PronunciationHistoryDTO {
	private Long classId;
	private Double averageCorrectRate;
	private LocalDateTime createdAt;
}
