package com.be.domain.auth.response;

import com.be.common.model.response.BaseResponseBody;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GetAuthUrlResponse extends BaseResponseBody {
	private String redirectUri;

	private GetAuthUrlResponse(String message, Integer status, String redirectUri) {
		super(message, status);
		this.redirectUri = redirectUri;
	}

	public static GetAuthUrlResponse of(String redirectUri) {
		return new GetAuthUrlResponse("Server response successfully", 200, redirectUri);
	}
}
