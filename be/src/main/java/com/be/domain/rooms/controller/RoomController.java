package com.be.domain.rooms.controller;

import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.RoomUserRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.rooms.request.CreateRoomRequest;
import com.be.domain.rooms.request.RoomRemoveRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.PostCreateRoomRes;
import com.be.domain.rooms.response.RoomJoinResponse;
import com.be.domain.rooms.response.RoomResponse;
import com.be.domain.rooms.service.RoomService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Getter
@Setter
@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

	private final UserRepository userRepository;
	private final RoomUserRepository roomUserRepository;
	private final RoomRepository roomRepository;
	private final RoomService roomService;

	/**
	 * 방 생성 API
	 */
	@PostMapping("/create")
	public PostCreateRoomRes createRoom(@RequestBody CreateRoomRequest request) {
		Long roomId = roomService.createRoom(request);
		return new PostCreateRoomRes("방 생성 성공", HttpStatus.OK, roomId);
	}

	/**
	 * 방 목록 조회 API
	 */
	@GetMapping("/list")
	public ResponseEntity<List<RoomResponse>> getAllRooms() {
		List<Room> rooms = roomRepository.findAll();

		// 활성화된 방만 응답
		List<RoomResponse> roomResponses = rooms.stream()
			.filter(Room::isActive)
			.map(room -> new RoomResponse(
				room.getId(),
				room.getTitle(),
				room.getHost().getUsername(),
				room.getUserCnt()))
			.toList();

		return ResponseEntity.ok(roomResponses);
	}

	/**
	 * 방 참가 API
	 * PathVariable {room_id}는 사용하지 않고
	 * request.getRoomId()를 사용하는 로직이므로
	 * URL에서 {room_id} 제거하거나,
	 * 실제로 사용하려면 request 객체 없이
	 * PathVariable 활용하도록 리팩토링 필요.
	 */
	@PostMapping("/join")
	public ResponseEntity<? extends BaseResponseBody> joinRoom(@RequestBody UserJoinRequest request) {
		log.info("Room ID: {}", request.getRoomId());
		log.info("User ID: {}", request.getUserId());

		RoomJoinResponse roomJoinResponse = roomService.joinRoom(request);
		return ResponseEntity.ok().body(roomJoinResponse);
	}

	/**
	 * 방 나가기 API(필요하다면 생성)
	 * WebSocket에서 처리 중이긴 하지만
	 * REST로도 요청하려면 아래와 같이
	 * 구현하면 됨 (예시).
	 */
	//    @PostMapping("/leave")
	//    public ResponseEntity<? extends BaseResponseBody> leaveRoom(@RequestBody UserLeaveRequest request) {
	//        roomService.leaveRoom(request);
	//        return ResponseEntity.ok().body(BaseResponseBody.of("방 떠나기 성공", 200));
	//    }

	/**
	 * 방 삭제 API(필요시)
	 * removeRoom은 실제로 DB 컬럼 isActive만 false로 바꾸며
	 * 방에 인원이 없다면만 처리함.
	 */
	@DeleteMapping("/remove")
	public ResponseEntity<BaseResponseBody> removeRoom(@RequestBody RoomRemoveRequest request) {
		boolean removed = roomService.removeRoom(request);
		if (removed) {
			return ResponseEntity.ok(BaseResponseBody.of("방 삭제(비활성화) 성공", 200));
		} else {
			return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(BaseResponseBody.of("방에 인원이 남아있어 삭제 불가", 409));
		}
	}

}
