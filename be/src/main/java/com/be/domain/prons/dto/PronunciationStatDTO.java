package com.be.domain.prons.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class PronunciationStatDTO {
	private Long classId;
	private Float averageCorrectRate;
	private Integer count;
}
