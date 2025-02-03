package com.be.domain.users.response;

import java.time.LocalDateTime;

import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GetCurrentUserResponse extends BaseResponseBody {
	@Schema(description = "사용자 ID (PK)", example = "1")
	private Long id;
	@Schema(description = "사용자 계정 ID", example = "john_doe123", name = "user_id")
	private String userId;
	@Schema(description = "사용자 이메일", example = "user@example.com")
	private String email;
	@Schema(description = "사용자 이름", example = "John Doe")
	private String username;
	@Schema(description = "소셜 로그인 제공자 (LOCAL, GOOGLE, NAVER 등)", example = "LOCAL")
	private String provider;
	@Schema(description = "계정 생성 일자", example = "2025-01-31T12:34:56", name = "created_at")
	private LocalDateTime createdAt;
	@Schema(description = "계정 정보 수정 일자", example = "2025-02-01T15:20:30", name = "updated_at")
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
			"User data retrieved successfully",
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
