package com.be.domain.prons.response;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationDataDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class GetClassDataRes extends BaseResponseBody {
	private List<PronunciationDataDTO> pronunciations;

	public GetClassDataRes(String message, HttpStatus statusCode, List<PronunciationDataDTO> pronunciations) {
		super(message, statusCode);
		this.pronunciations = pronunciations;
	}
}
