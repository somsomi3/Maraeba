package com.be.domain.rooms.service;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.response.GameResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    @Autowired
    private RoomRepository roomRepository;

    // 🔹 게임 시작
    public String startGame(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        room.setActive(true);
        roomRepository.save(room);
        return "Game started in room " + roomId;
    }

    // 🔹 보기 선택
    public String chooseOption(Long userId, Long roomId, String choice) {
        // 선택을 저장하는 로직 추가
        return "User " + userId + " chose " + choice + " in room " + roomId;
    }

    // 🔹 정답 조회
    public GameResult getGameResult(Long roomId) {
        GameResult result = new GameResult();
        result.setRoomId(roomId);
        result.setCorrectAnswer("정답");  // 정답 로직 필요
        result.setUserCorrect(true);  // 사용자의 선택이 정답인지 확인하는 로직 필요
        return result;
    }
}