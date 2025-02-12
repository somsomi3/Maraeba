package com.be.domain.prons.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PostSimilarityReq {
	@NotBlank
	private String sessionId;

	@NotNull
	private Long pronId;

	@NotNull
	private Integer isCorrect;
}
