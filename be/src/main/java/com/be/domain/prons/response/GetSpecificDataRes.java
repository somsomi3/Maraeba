package com.be.domain.prons.response;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationDataDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetSpecificDataRes extends BaseResponseBody {
	private PronunciationDataDTO data;

	public GetSpecificDataRes(String message, Integer statusCode, PronunciationDataDTO data) {
		super(message, statusCode);
		this.data = data;
	}
}
