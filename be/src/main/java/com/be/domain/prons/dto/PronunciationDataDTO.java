package com.be.domain.prons.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class PronunciationDataDTO {

	private Long id;
	private String pronunciation;
	private String description;
	private Integer sequence;
	private String tongueImageUrl;
	private String lipVideoUrl;

}
