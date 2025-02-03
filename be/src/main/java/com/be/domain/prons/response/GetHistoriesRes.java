package com.be.domain.prons.response;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.common.model.response.PageResponse;
import com.be.domain.prons.dto.PronunciationHistoryDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetHistoriesRes extends BaseResponseBody {
	private PageResponse<PronunciationHistoryDTO> histories;

	public GetHistoriesRes(String message, HttpStatus statusCode, PageResponse<PronunciationHistoryDTO> histories) {
		super(message, statusCode);
		this.histories = histories;
	}
}
