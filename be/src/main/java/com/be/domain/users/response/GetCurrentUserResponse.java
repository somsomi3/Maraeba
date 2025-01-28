package com.be.domain.users.response;

import java.time.LocalDateTime;

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
	LocalDateTime createdAt;
	LocalDateTime updatedAt;

	public static GetCurrentUserResponse from(User user, String message, Integer status) {
		GetCurrentUserResponse response = new GetCurrentUserResponse();
		response.setMessage(message);
		response.setStatusCode(status);
		response.id = user.getId();
		response.userId = user.getUserId();
		response.email = user.getEmail();
		response.username = user.getUsername();
		response.provider = user.getProvider();
		response.createdAt = user.getCreatedAt();
		response.updatedAt = user.getUpdatedAt();
		return response;
	}
}
