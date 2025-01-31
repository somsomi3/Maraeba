package com.be.domain.prons.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSessionReq {
	@NotNull
	private Long userId;
	@NotNull
	private Long classId;
}
