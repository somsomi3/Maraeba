package com.be.domain.auth.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserIdResponseDto {
	private String userId;
	private LocalDateTime createdAt;
	private String provider;
}
