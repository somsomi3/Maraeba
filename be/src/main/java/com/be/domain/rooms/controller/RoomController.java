package com.be.domain.rooms.controller;
import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.RoomUserRepository;
import com.be.db.repository.UserRepository;

import com.be.domain.rooms.SignalingHandler;
import com.be.domain.rooms.request.CreateRoomRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.request.UserLeaveRequest;
import com.be.domain.rooms.response.RoomJoinResponse;
import com.be.domain.rooms.response.RoomResponse;
import com.be.domain.rooms.service.RoomService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections; // ✅ 빈 JSON 반환을 위한 import 추가

import java.util.List;
import java.util.Set;

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

    private final SignalingHandler signalingHandler; // ✅ WebSocket 핸들러 주입

    // ✅ 특정 방의 참가자 목록 조회 API

    // ✅ 특정 방의 참가자 목록 조회 API
    @GetMapping("/room-users/{roomId}")
    public ResponseEntity<Set<Long>> getRoomUsers(@PathVariable String roomId) {
        log.info("📌 getRoomUsers API 호출됨, roomId: {}", roomId);
        log.info("🔍 방 참가자 목록 요청: roomId={}", roomId); // ✅ 요청 로그 추가
        Set<Long> userIds = signalingHandler.getRoomUserIds(roomId);

        if (userIds == null || userIds.isEmpty()) {
            log.info("❌ 방 {}에는 참가자가 없습니다.", roomId);
            return ResponseEntity.ok(Collections.emptySet()); // ✅ 빈 JSON `[]` 반환
        }
        log.info("✅ 방 {} 참가자 목록 반환: {}", roomId, userIds);
        return ResponseEntity.ok(userIds);
    }

    // 방 생성 API
    @PostMapping("/create")
    public ResponseEntity<? extends BaseResponseBody> createRoom(@RequestBody CreateRoomRequest request) {
//        // ✅ hostId를 이용해 User 조회
//        User host = userRepository.findById(request.getHostId())
//            .orElseThrow(() -> new RuntimeException("User not found"));
//        // ✅ 생성자를 사용하여 간결하게 Room 객체 생성
//        Room savedRoom = roomRepository.save(new Room(request.getTitle(), request.getRoomPassword(), host));

        //방생성
        roomService.createRoom(request);
        return ResponseEntity.ok().body(BaseResponseBody.of("방생성 성공",200));
    }

    @GetMapping("/list")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();

        // ✅ Room 리스트를 RoomResponse 리스트로 변환
        List<RoomResponse> roomResponses = rooms.stream()
            //다음줄에 포함된 각각의 id는
            .map(room -> new RoomResponse(room.getId(), room.getTitle(), room.getHost().getUsername()))
            .toList();

        return ResponseEntity.ok(roomResponses);
    }



    @PostMapping("/join/{room_id}")
    public ResponseEntity<? extends BaseResponseBody> joinRoom(@RequestBody UserJoinRequest request) {
        log.info("Room ID: {}", request.getRoom());  // Room ID 로그
        log.info("User ID: {}", request.getUser());  // User ID 로그

        RoomJoinResponse roomJoinResponse = roomService.joinRoom(request);
        return ResponseEntity.ok().body(roomJoinResponse);
    }



    @PostMapping("/leave/{roomId}")
    public ResponseEntity<? extends BaseResponseBody> leaveRoom(@RequestBody UserLeaveRequest request, @PathVariable Long roomId) {
        System.out.println("Received roomId: " + roomId);  // 방 ID 출력
        System.out.println("Received roomId: " + request.getRoom());  // 방 ID 출력
        System.out.println("Received userId: " + request.getUser());  // 사용자 ID 출력

        roomService.leaveRoom(request);
        roomUserRepository.deleteByUserIdAndRoomId(request.getUser(), roomId);
        return ResponseEntity.ok().body(BaseResponseBody.of("방삭제요청 성공", 200));
    }

    // 방 생성 요청을 처리할 DTO

}
