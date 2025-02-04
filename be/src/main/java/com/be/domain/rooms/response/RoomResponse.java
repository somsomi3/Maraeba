package com.be.domain.rooms.response;

import com.be.db.entity.Room;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse {
	@JsonProperty("id")
	private Long id;

	@JsonProperty("title")
	private String title;

	@JsonProperty("hostUsername")
	private String hostUsername; // 방장의 이름만 전달

	// public RoomResponse(Room room) {
	// 	this.id = room.getId();
	// 	this.title = room.getTitle();
	// 	this.hostUsername = room.getHost().getUsername();
	// }
}
