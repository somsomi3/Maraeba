package com.be.domain.rooms.controller;
import com.be.db.entity.Room;
import com.be.db.entity.User;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.UserRepository;

import com.be.domain.rooms.request.CreateRoomRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.RoomResponse;
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
        // ✅ hostId를 이용해 User 조회
        User host = userRepository.findById(request.getHostId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ 생성자를 사용하여 간결하게 Room 객체 생성
        Room savedRoom = roomRepository.save(new Room(request.getTitle(), request.getRoomPassword(), host));


        return ResponseEntity.ok(savedRoom);
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
    public String joinRoom(@PathVariable("room_id") Long roomId, @RequestBody UserJoinRequest request) {
        return roomService.joinRoom(request.getUserId(), roomId);
    }

    @PostMapping("/end/{room_id}")
    public String leaveRoom(@PathVariable("room_id") Long roomId, @RequestBody UserJoinRequest request) {
        return roomService.leaveRoom(request.getUserId(), roomId);
    }
    // 방 생성 요청을 처리할 DTO

}
