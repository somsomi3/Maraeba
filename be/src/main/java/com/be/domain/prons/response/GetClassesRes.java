package com.be.domain.prons.response;

import java.util.List;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationClassDTO;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class GetClassesRes extends BaseResponseBody {

	private List<PronunciationClassDTO> classes;

	public GetClassesRes(String message, HttpStatus statusCode, List<PronunciationClassDTO> classes) {
		super(message, statusCode);
		this.classes = classes;
	}
}
