package com.be.domain.prons.response;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationDetailStatDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class GetDetailStatRes extends BaseResponseBody {
	List<PronunciationDetailStatDTO> stats;

	public GetDetailStatRes(String message, HttpStatus statusCode, List<PronunciationDetailStatDTO> stats) {
		super(message, statusCode);
		this.stats = stats;
	}
}
