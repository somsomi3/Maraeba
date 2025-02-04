package com.be.domain.prons.response;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationStatDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetStatsRes extends BaseResponseBody {
	List<PronunciationStatDTO> stats;

	public GetStatsRes(String message, HttpStatus statusCode, List<PronunciationStatDTO> stats) {
		super(message, statusCode);
		this.stats = stats;
	}
}
