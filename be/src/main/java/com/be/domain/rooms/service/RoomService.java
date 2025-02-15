package com.be.domain.rooms.service;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.Room;
import com.be.db.entity.RoomUser;
import com.be.db.entity.User;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.RoomUserRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.rooms.request.CreateRoomRequest;
import com.be.domain.rooms.request.RoomRemoveRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.request.UserLeaveRequest;
import com.be.domain.rooms.response.RoomJoinResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

	private final RoomRepository roomRepository;
	private final UserRepository userRepository;
	private final RoomUserRepository roomUserRepository;

	/**
	 * 방 목록 조회
	 */
	public List<Room> getAllRooms() {
		return roomRepository.findAll();
	}

	/**
	 * 방 생성
	 */
	@Transactional
	public Long createRoom(CreateRoomRequest request) {
		// 호스트(방장) User 엔티티 조회
		User hostUser = userRepository.findById(request.getHostId())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// Room 생성
		Room createRoom = new Room();
		createRoom.setHost(hostUser);
		createRoom.setRoomPassword(request.getRoomPassword());
		createRoom.setTitle(request.getTitle());

		// DB에 저장
		Room savedRoom = roomRepository.save(createRoom);

		// roomUser에도 방장 정보 저장
		RoomUser roomUser = new RoomUser();
		roomUser.setRoom(savedRoom);
		roomUser.setUser(hostUser);
		roomUser.setIsHost(true);
		roomUserRepository.save(roomUser);

		// 방장 포함 인원 1명
		savedRoom.setUserCnt(1);
		roomRepository.save(savedRoom);

		return savedRoom.getId();
	}

	/**
	 * 방 참가
	 */
	@Transactional
	public RoomJoinResponse joinRoom(UserJoinRequest request) {
		Long roomId = Long.valueOf(request.getRoomId());
		Long userId = request.getUserId();

		// 방, 사용자 엔티티 조회
		Room room = roomRepository.findById(roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND,"방 아이디 찾기 실패"));
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		if(!room.isActive()) { // 비활성화된 방에 접근 시도
			throw new CustomException(ErrorCode.ROOM_NOT_FOUND,"비활성화된 방 참가");
		}

		// RoomUser 중복 여부 체크
		Optional<RoomUser> existing = roomUserRepository.findByUserIdAndRoomId(userId, roomId);
		if (existing.isPresent()) {
			// 이미 참가 중인 유저면 userCnt 변경 없이 곧바로 OK 응답
			log.info("사용자({})는 이미 방({})에 참가중.", userId, roomId);
			return RoomJoinResponse.of(200, existing.get().getIsHost());
		}

		if (room.getUserCnt() >= 2) {
			throw new CustomException(ErrorCode.ROOM_NOT_FOUND, "방 인원 초과");
		}

		// DB에 RoomUser 추가
		boolean isHost = room.getHost().getId().equals(userId);
		RoomUser roomUser = new RoomUser();
		roomUser.setRoom(room);
		roomUser.setUser(user);
		roomUser.setIsHost(isHost);
		roomUserRepository.save(roomUser);

		// 방 인원 수 증가
		room.setUserCnt(room.getUserCnt() + 1);

		log.info("사용자({})가 방({})에 참가. 방장 여부: {}", userId, roomId, isHost);
		return RoomJoinResponse.of(200, isHost);
	}

	/**
	 * 방 나가기
	 */
	@Transactional
	public String leaveRoom(UserLeaveRequest request) {
		Long roomId = Long.valueOf(request.getRoomId());
		Long userId = request.getUserId();

		Optional<RoomUser> roomUserOpt = roomUserRepository.findByUserIdAndRoomId(userId, roomId);
		if (roomUserOpt.isEmpty()) {
			// 여기서 예외 대신, "이미 나간 상태"로 간주하고 로직 종료
			log.info("중복 leave 요청: 사용자({}) 방({}) 이미 떠났습니다.", userId, roomId);
			return "User " + userId + " already left room " + roomId;
			// 방 안에 해당 유저가 없으면 예외
			// throw new CustomException(ErrorCode.USER_NOT_FOUND);
		}

		// 방에서 해당 사용자 삭제
		roomUserRepository.delete(roomUserOpt.get());
		log.info("사용자({})가 방({})에서 나갔습니다.", userId, roomId);

		// 방 인원 수 감소
		Room room = roomRepository.findById(roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
		// 인원이 0 미만이 되지 않도록 처리
		int currentCnt = Math.min(room.getUserCnt(), 2);
		int updatedCount = Math.max(currentCnt - 1, 0);
		room.setUserCnt(updatedCount);

		//userCnt가 0이 되면, 방을 비활성화(isActive = false) 시도
		if (updatedCount == 0) {
			room.setActive(false);
		}

		// 변경된 부분 DB에 반영
		roomRepository.save(room);

		return "User " + userId + " left room " + roomId;
	}

	/**
	 * 방 삭제 (사람이 한 명도 없을 때만)
	 */
	@Transactional
	public boolean removeRoom(RoomRemoveRequest request) {
		Long roomId = Long.valueOf(request.getRoomId());

		// 방에 남아있는 사용자 확인
		List<RoomUser> roomUserList = roomUserRepository.findByRoomId(roomId);
		if (roomUserList == null || roomUserList.isEmpty()) {
			// 방 조회 후 비활성화 처리
			Room room = roomRepository.findById(roomId)
				.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));
			room.setActive(false);
			log.info("방({})에 인원이 없어 방을 비활성화했습니다.", roomId);
			return true;
		} else {
			log.info("방({})에 아직 인원이 남아 방을 비활성화하지 않습니다.", roomId);
			return false;
		}
	}
}
