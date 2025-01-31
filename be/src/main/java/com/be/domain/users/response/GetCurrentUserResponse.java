package com.be.domain.users.response;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetCurrentUserResponse extends BaseResponseBody {
	Long id;
	String userId;
	String email;
	String username;
	String provider;
	LocalDateTime createDate;
	LocalDateTime modifyDate;

	public static GetCurrentUserResponse from(User user, String message, HttpStatus status) {
		GetCurrentUserResponse response = new GetCurrentUserResponse();
		response.setMessage(message);
		response.setStatusCode(status.value());
		response.id = user.getId();
		response.userId = user.getUserId();
		response.email = user.getEmail();
		response.username = user.getUsername();
		response.provider = user.getProvider();
		response.createDate = user.getCreatedAt();
		response.modifyDate = user.getUpdatedAt();
		return response;
	}
}
