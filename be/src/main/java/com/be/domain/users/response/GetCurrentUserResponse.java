package com.be.domain.users.response;

import java.time.LocalDateTime;

import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.User;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GetCurrentUserResponse extends BaseResponseBody {
	private Long id;
	private String userId;
	private String email;
	private String username;
	private String provider;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private GetCurrentUserResponse(String message, Integer status, Long id, String userId, String email, String username, String provider, LocalDateTime createdAt, LocalDateTime updatedAt) {
		super(message, status);
		this.id = id;
		this.userId = userId;
		this.email = email;
		this.username = username;
		this.provider = provider;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public static GetCurrentUserResponse from(User user) {
		return new GetCurrentUserResponse(
			"Current user data founded successfully",
			200,
			user.getId(),
			user.getUserId(),
			user.getEmail(),
			user.getUsername(),
			user.getProvider(),
			user.getCreatedAt(),
			user.getUpdatedAt()
		);
	}
}
