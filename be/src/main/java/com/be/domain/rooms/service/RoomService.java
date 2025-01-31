package com.be.domain.rooms.service;

import com.be.db.entity.Room;
import com.be.db.entity.RoomUser;
import com.be.db.entity.User;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.RoomUserRepository;
import com.be.db.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    public Room createRoom(String title, String roomPassword, Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = new Room();
        room.setTitle(title);
        room.setRoomPassword(roomPassword);
        room.setHost(host);
        room.setStartedAt(LocalDateTime.now());
        room.setActive(true);

        return roomRepository.save(room);
    }

    // 🔹 방 참가
    public String joinRoom(Long userId, Long roomId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        RoomUser roomUser = new RoomUser();
        roomUser.setUser(user);
        roomUser.setRoom(room);
        roomUser.setJoinedAt(LocalDateTime.now());

        roomUserRepository.save(roomUser);
        return "User " + userId + " joined room " + roomId;
    }

    // 🔹 방 나가기
    public String leaveRoom(Long userId, Long roomId) {
        Optional<RoomUser> roomUser = roomUserRepository.findByUserIdAndRoomId(userId, roomId);
        if (roomUser.isPresent()) {
            roomUserRepository.delete(roomUser.get());
            return "User " + userId + " left room " + roomId;
        } else {
            throw new RuntimeException("User is not in this room");
        }
    }
}