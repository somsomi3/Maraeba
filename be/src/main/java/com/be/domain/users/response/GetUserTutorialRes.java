package com.be.domain.users.response;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.users.dto.UserTutorialDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GetUserTutorialRes extends BaseResponseBody {

	private UserTutorialDTO data;

	public GetUserTutorialRes(String message, HttpStatus statusCode, UserTutorialDTO data) {
		super(message, statusCode);
		this.data = data;
	}
}
