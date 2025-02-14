package com.be.domain.rooms.controller;

import java.util.List;
import java.util.Map;

import com.be.common.model.response.BaseResponseBody;
import com.be.db.entity.BaseEntity;
import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.rooms.request.UserChoiceRequest;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.GameResult;
import com.be.domain.rooms.response.GameStartResponse;
import com.be.domain.rooms.service.ColorItemService;
import com.be.domain.rooms.service.GameService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/game")
public class GameController {

    private final GameService gameService;
    private final RoomRepository roomRepository;
    private final ColorItemService colorItemService;

    @GetMapping("/items")
    public ResponseEntity
            <Map<String, String>> getGameItems() {

        return ResponseEntity.status(200).body(colorItemService.getRandomWordsByColor());
    }

    //게임 시작
    @PostMapping("/start/{room_id}")
    public ResponseEntity<GameStartResponse> startGame(
        @PathVariable("room_id") Long roomId,
        @RequestBody UserJoinRequest request) {

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isHost = room.getHost().getId().equals(request.getUser()); // 현재 사용자가 방장인지 확인

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
