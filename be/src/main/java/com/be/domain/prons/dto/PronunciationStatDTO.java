package com.be.domain.prons.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PronunciationStatDTO {
	private Long classId;
	private Float averageSimilarity;
	private Integer count;
}
