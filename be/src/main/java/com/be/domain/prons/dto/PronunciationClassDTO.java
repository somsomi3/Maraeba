package com.be.domain.prons.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class PronunciationClassDTO {
	private Long id;
	private String title;
	private String description;

}
