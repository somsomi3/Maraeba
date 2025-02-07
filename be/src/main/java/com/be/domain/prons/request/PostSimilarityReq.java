package com.be.domain.prons.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSimilarityReq {
	@NotBlank
	private String sessionId;
	@NotNull
	private Integer isCorrect;
}
