package com.be.domain.rooms.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse {
	private Long id;

	private String title;

	private String hostUserId;

	private String hostUsername; // 방장의 이름만 전달

	private int userCnt;

	private boolean roomPassword;

}
