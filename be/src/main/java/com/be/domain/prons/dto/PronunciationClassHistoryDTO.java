package com.be.domain.prons.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PronunciationClassHistoryDTO {
	private double averageCorrectRate;
	private LocalDateTime createdAt;
}
