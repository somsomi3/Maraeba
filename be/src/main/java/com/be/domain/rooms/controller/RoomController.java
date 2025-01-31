package com.be.domain.rooms.controller;
import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.UserRepository;

import com.be.domain.rooms.request.CreateRoomRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.service.RoomService;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@RestController
@RequestMapping("/rooms")
public class RoomController {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomService roomService;

    // 방 생성 API
    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody CreateRoomRequest request) {
        // ✅ 새로운 방 생성
        Room newRoom = new Room();
        newRoom.setTitle(request.getTitle()); // ✅ title 필드를 사용
        newRoom.setActive(true);
        newRoom.setStartedAt(LocalDateTime.now());
        newRoom.setRoomPassword(request.getRoomPassword());

        // 방 소유자 설정 (필요하면 추가)
        // newSession.setHost(userService.getCurrentUser());

        // ✅ 방 저장 후 반환
        Room savedRoom = roomRepository.save(newRoom);

        return ResponseEntity.ok(savedRoom);
    }
    // 방 목록 조회 API
    @GetMapping("/list")
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
    @PostMapping("/join/{room_id}")
    public String joinRoom(@PathVariable("room_id") Long roomId, @RequestBody UserJoinRequest request) {
        return roomService.joinRoom(request.getUserId(), roomId);
    }

    @PostMapping("/end/{room_id}")
    public String leaveRoom(@PathVariable("room_id") Long roomId, @RequestBody UserJoinRequest request) {
        return roomService.leaveRoom(request.getUserId(), roomId);
    }
    // 방 생성 요청을 처리할 DTO

}
