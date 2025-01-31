package com.be.domain.prons.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSimilarityReq {
	@NotBlank
	private String sessionId;
	@NotBlank
	private double similarity;
}
