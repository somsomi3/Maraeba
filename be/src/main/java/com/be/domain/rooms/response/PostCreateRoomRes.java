package com.be.domain.rooms.response;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRoomRes extends BaseResponseBody {
	private Long roomId;

	public PostCreateRoomRes(String message, HttpStatus statusCode, Long roomId) {
		super(message, statusCode);
		this.roomId = roomId;
	}
}
