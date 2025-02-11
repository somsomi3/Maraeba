package com.be.domain.prons.response;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationClassDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class GetClassesRes extends BaseResponseBody {

	private List<PronunciationClassDTO> classes;

	public GetClassesRes(String message, HttpStatus statusCode, List<PronunciationClassDTO> classes) {
		super(message, statusCode);
		this.classes = classes;
	}
}
