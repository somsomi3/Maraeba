package com.be.domain.prons.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PronunciationHistoryDTO {
	private Long classId;
	private Double averageSimilarity;
	private LocalDateTime createdAt;
}
