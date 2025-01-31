package com.be.domain.prons.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSimilarityReq {
	private String sessionId;
	private Double similarity;
}
