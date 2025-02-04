package com.be.domain.rooms.controller;

import java.util.List;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.request.UserChoiceRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.GameResult;
import com.be.domain.rooms.response.GameStartResponse;
import com.be.domain.rooms.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
public class GameController {
    @Autowired
    private GameService gameService;
    private RoomRepository roomRepository;

    @GetMapping("/items")
    public ResponseEntity<List<String>> getGameItems() {
        List<String> items = List.of("딸기", "바나나", "피클", "자동차");
        return ResponseEntity.ok(items);
    }
    //게임 시작
    @PostMapping("/start/{room_id}")
    public ResponseEntity<GameStartResponse> startGame(
        @PathVariable("room_id") Long roomId,
        @RequestBody UserJoinRequest request) {

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isHost = room.getHost().getId().equals(request.getUserId()); // 현재 사용자가 방장인지 확인

        return ResponseEntity.ok(new GameStartResponse(roomId, isHost));
    }

    //게임에서 사용자 선택
    @PostMapping("/choice/{room_id}")
    public String chooseOption(@PathVariable("room_id") Long roomId, @RequestBody UserChoiceRequest request) {
        return gameService.chooseOption(request.getUserId(), roomId, request.getChoice());
    }

    @GetMapping("/result/{room_id}")
    public GameResult getResult(@PathVariable("room_id") Long roomId) {
        return gameService.getGameResult(roomId);
    }
}
