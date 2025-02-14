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
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.request.UserLeaveRequest;
import com.be.domain.rooms.response.RoomJoinResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomUserRepository roomUserRepository;

    // 🔹 방 목록 조회
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // 🔹 방 생성
    public void createRoom(CreateRoomRequest request) {
        Room createRoom = new Room();
        createRoom.setHost(userRepository.findById(request.getHostId()).orElseThrow(()->new CustomException(ErrorCode.USER_NOT_FOUND)));
        createRoom.setRoomPassword(request.getRoomPassword());
        createRoom.setTitle(request.getTitle());
        roomRepository.save(createRoom);
    }

    // 🔹 방 참가
    @Transactional
    public RoomJoinResponse joinRoom(UserJoinRequest request) {
        System.out.println("Room ID: " + request.getRoom());  // Room ID가 null인지 확인
        System.out.println("User ID: " + request.getUser());  // User ID가 null인지 확인

        // 해당 방과 사용자 조회
        Room room = roomRepository.findById(Long.valueOf(request.getRoom()))
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));  // 해당 방 조회
        room.setUserCnt(room.getUserCnt() + 1);
        User user = userRepository.findById(request.getUser())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));  // 해당 사용자 조회

        // 로그 추가: room의 host_id와 user_id 확인
        System.out.println("!!!!!!!Room's host_id: " + room.getHost().getId());  // 방장의 ID
        System.out.println("!!!!!!!User's user_id: " + user.getId());  // 사용자의 ID

        // 방장 여부 확인 (roomUser에 방장 설정)
        boolean isHost = (room.getHost().getId()).equals(user.getId());  // 방장의 ID와 사용자의 ID 비교
        System.out.println("isHost: " + isHost); // 방장 여부 출력
        // RoomUser 객체 생성 후 방장 여부 설정
        RoomUser roomUser = new RoomUser();
        roomUser.setRoom(room);  // 해당 방 설정
        roomUser.setUser(user);  // 해당 사용자 설정
        roomUser.setIsHost(isHost);  // 방장 여부 설정

        // 방에 참가한 사용자 데이터 저장
        roomUserRepository.save(roomUser);


        return RoomJoinResponse.of(200,isHost);
    }


    // 🔹 방 나가기
    public String leaveRoom(UserLeaveRequest request) {
        Long roomId = Long.valueOf(request.getRoom());  // Room ID 받아오기
        Long userId = request.getUser();  // User ID 받아오기

        System.out.println("Room ID: " + roomId);  // Room ID가 null인지 확인
        System.out.println("User ID: " + userId);  // User ID가 null인지 확인

        // 방에서 해당 사용자가 있는지 확인
        Optional<RoomUser> roomUser = roomUserRepository.findByUserIdAndRoomId(userId, roomId);

        if (roomUser.isPresent()) {
            // 방에서 해당 사용자 삭제
            roomUserRepository.delete(roomUser.get());
            return "User " + userId + " left room " + roomId;
        } else {
            // 해당 사용자가 방에 없으면 예외 처리
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
    }
}