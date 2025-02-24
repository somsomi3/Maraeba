package com.be.domain.rooms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.be.domain.rooms.request.ValidUserRequest;
import com.be.domain.rooms.response.RoomJoinResponse;
import com.be.domain.rooms.response.RoomResponse;
import com.be.domain.rooms.response.ValidUserResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
	@Transactional(readOnly = true)
	public List<RoomResponse> getAllRooms() {
		List<Room> rooms = roomRepository.findAll();

		return rooms.stream()
			.filter(Room::isActive) // 활성화된 방만 필터링
			.map(room -> new RoomResponse(
				room.getId(),
				room.getTitle(),
				room.getHost().getUserId(),
				room.getHost().getUsername(),
				room.getUserCnt(),
				room.getRoomPassword() != null && !room.getRoomPassword().isBlank()
			))
			.toList();
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
		roomUser.setIsExist(false);
		roomUserRepository.save(roomUser);

		// 방장 포함 인원 1명
		savedRoom.setUserCnt(0);
		roomRepository.save(savedRoom);

		return savedRoom.getId();
	}

	/**
	 * 방 참가
	 */
	@Transactional
	public RoomJoinResponse joinRoom(UserJoinRequest request) {
		Long roomId = request.getRoomId();
		Long userId = request.getUserId();
		String roomPW = request.getRoomPassword();

		// 방, 사용자 엔티티 조회
		Room room = roomRepository.findById(roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND,"방 아이디 찾기 실패"));
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 비밀번호가 있는 방이면 비밀번호 확인
		if (room.getRoomPassword() != null) {
			if (!request.getRoomPassword().equals(room.getRoomPassword())) {
				throw new CustomException(ErrorCode.ROOM_PASSWORD_INCORRECT);
			}
		}
		boolean isHost = room.getHost().getId().equals(userId);
		// 방목록에서 입장한 적이 있는지 확인
		if(roomUserRepository.findByUserIdAndRoomId(userId, roomId).isEmpty()) {
			if(room.getUserCnt()>=2) {
				throw new CustomException(ErrorCode.ROOM_IS_FULL,"방이 가득 찼습니다.");
			}
			RoomUser temp = new RoomUser();
			temp.setRoom(room);
			temp.setUser(user);
			temp.setIsHost(isHost);
			temp.setIsExist(false);
			roomUserRepository.save(temp);
		}
		log.info("사용자({})가 방({})에 참가. 방장 여부: {}", userId, roomId, isHost);
		return RoomJoinResponse.of(200, isHost);
	}

	/**
	 * 입장한 사람이 유효한지 확인
	 */
	@Transactional
	public ValidUserResponse validUser(ValidUserRequest request) {
		Long roomId = request.getRoomId();
		Long userId = request.getUserId();

		// 방, 사용자 엔티티 조회
		Room room = roomRepository.findById(roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND, "방 아이디 찾기 실패"));
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		if (room.getUserCnt() >= 2) {
			room.setUserCnt(room.getUserCnt() + 1); // 잠시 올렸다가 내림
			roomRepository.save(room);
			throw new CustomException(ErrorCode.ROOM_NOT_FOUND, "방 인원 초과");
		}

		// 방목록에서 입장한 적이 있는지 확인
		RoomUser roomUser = roomUserRepository.findByUserIdAndRoomId(userId, roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_USER_NOT_FOUND, "룸유저를 찾을 수 없습니다."));
		// 이미 참가 중인 유저면 userCnt 변경 없이 곧바로 OK 응답
		log.info("입장 : {}}({}) {}({})에 참가 시도.", user.getUsername(), userId, room.getTitle(), roomId);
		if (roomUser.getIsExist()) {
			log.info("중복 입장 감지 → 기존 세션 강제 leave 처리를 진행합니다.");
			roomUser.setIsExist(false);
			room.setUserCnt(room.getUserCnt() - 1);
			if (room.getUserCnt() == 0)
				room.setActive(false);
		}
		roomUser.setIsExist(true); // 방에 존재한다고 표시
		room.setUserCnt(room.getUserCnt() + 1); // 존재하게 되어서 인원 수 증가
		room.setActive(true);
		return ValidUserResponse.of(user.getUsername(), roomUser.getIsHost(), room.getUserCnt());
	}


	/**
	 * 방 나가기
	 */
	@Transactional
	public void leaveRoom(UserLeaveRequest request) {
		Long roomId = Long.valueOf(request.getRoomId());
		Long userId = request.getUserId();

		Optional<RoomUser> roomUserOpt = roomUserRepository.findByUserIdAndRoomId(userId, roomId);
		if (roomUserOpt.isEmpty()) {
			// 여기서 예외 대신, "이미 나간 상태"로 간주하고 로직 종료
			log.info("중복 leave 요청: 사용자({}) 방({}) 이미 떠났습니다.", userId, roomId);
		}
		RoomUser roomUser = roomUserOpt.get();
		if (!roomUser.getIsExist()) {
			// 이미 isExist=false => 중복 leave
			log.info("중복 leave 요청(isExist=false): 사용자({}) 방({}) 이미 떠났습니다.", userId, roomId);
			return;
		}
		// 여기부터는 진짜로 나가는 사람
		log.info("사용자({})가 방({})에서 나갔습니다.", userId, roomId);

		roomUser.setIsExist(false);

		// 방 인원 수 감소
		Room room = roomRepository.findById(roomId)
			.orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

		// 인원이 0 미만이 되지 않도록 처리
		room.setUserCnt(room.getUserCnt()-1);

		//userCnt가 0이 되면, 방을 비활성화(isActive = false) 시도
		if (room.getUserCnt() <= 0) {
			room.setActive(false);
		}

		// 변경된 부분 DB에 반영
		roomRepository.save(room);

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
