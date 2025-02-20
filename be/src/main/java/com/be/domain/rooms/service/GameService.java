package com.be.domain.rooms.service;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.response.GameStartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    @Autowired
    private RoomRepository roomRepository;

    // 🔹 게임 시작
    public GameStartResponse startGame(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isHost = room.getHost().getId().equals(userId); // 방장 확인
        room.setActive(true);
        roomRepository.save(room);

        return new GameStartResponse(roomId, isHost);
    }
}