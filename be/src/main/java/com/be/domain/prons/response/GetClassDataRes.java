package com.be.domain.prons.response;

import java.util.List;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationDataDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetClassDataRes extends BaseResponseBody {
	private List<PronunciationDataDTO> pronunciations;

	public GetClassDataRes(String message, Integer statusCode, List<PronunciationDataDTO> pronunciations) {
		super(message, statusCode);
		this.pronunciations = pronunciations;
	}
}
