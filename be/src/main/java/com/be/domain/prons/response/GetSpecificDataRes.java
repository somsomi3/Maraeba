package com.be.domain.prons.response;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationDataDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class GetSpecificDataRes extends BaseResponseBody {
	private PronunciationDataDTO data;

	public GetSpecificDataRes(String message, HttpStatus statusCode, PronunciationDataDTO data) {
		super(message, statusCode);
		this.data = data;
	}
}
