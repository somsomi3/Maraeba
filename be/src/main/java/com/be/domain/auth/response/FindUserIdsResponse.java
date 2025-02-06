package com.be.domain.auth.response;

import java.util.List;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.dto.UserIdResponseDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FindUserIdsResponse extends BaseResponseBody {

	@Schema(description = "이메일과 연결된 사용자 ID 목록",
		example = "[{\"userId\":\"test_user1\", \"createdAt\":\"2023-10-06T12:34:56\", \"provider\":\"kakao\"}, " +
			"{\"userId\":\"test_user2\", \"createdAt\":\"2023-09-15T10:22:33\", \"provider\":\"google\"}]",
		name = "user_ids")
	private List<UserIdResponseDto> userIds;

	private FindUserIdsResponse(String message, Integer status, List<UserIdResponseDto> userIds) {
		super(message, status);
		this.userIds = userIds;
	}

	public static FindUserIdsResponse of(String message, Integer status, List<UserIdResponseDto> userIds) {
		return new FindUserIdsResponse(message, status, userIds);
	}
}
