package com.be.domain.prons.response;

import java.util.List;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationClassDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetClassesRes extends BaseResponseBody {

	private List<PronunciationClassDTO> classes;

	public GetClassesRes(String message, Integer statusCode, List<PronunciationClassDTO> classes) {
		super(message, statusCode);
		this.classes = classes;
	}
}
