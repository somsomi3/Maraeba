package com.be.domain.prons.response;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationClassHistoryDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetClassHistoryRes extends BaseResponseBody {

	private List<PronunciationClassHistoryDTO> histories;

	public GetClassHistoryRes(String message, HttpStatus statusCode, List<PronunciationClassHistoryDTO> histories) {
		super(message, statusCode);
		this.histories = histories;
	}
}
