package com.be.domain.users.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
	private String email;
	private String username;
}
