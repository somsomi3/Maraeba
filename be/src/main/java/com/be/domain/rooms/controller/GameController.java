package com.be.domain.rooms.controller;

import java.util.Map;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.GameStartResponse;
import com.be.domain.rooms.service.ColorItemService;
import com.be.domain.rooms.service.GameService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/rgames")
public class GameController {

    private final GameService gameService;
    private final RoomRepository roomRepository;
    private final ColorItemService colorItemService;

    //게임 아이템 목록 가져오기
    @GetMapping("/item")
    public ResponseEntity
            <Map<String, String>> getGameItems() {

        return ResponseEntity.status(200).body(colorItemService.getRandomWordsByColor());
    }

    // 게임 시작 (왜 필요한지 모르겠음)
    @PostMapping("/start/{room_id}")
    public ResponseEntity<GameStartResponse> startGame(
        @PathVariable("room_id") Long roomId,
        @RequestBody UserJoinRequest request) {

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isHost = room.getHost().getId().equals(request.getUserId()); // 현재 사용자가 방장인지 확인

        return ResponseEntity.ok(new GameStartResponse(roomId, isHost));
    }

//    //게임에서 사용자 선택 -> handler처리
//    @PostMapping("/choice/{room_id}")
//    public String chooseOption(@PathVariable("room_id") Long roomId, @RequestBody UserChoiceRequest request) {
//        return gameService.chooseOption(request.getUserId(), roomId, request.getChoice());
//    }
//
//    //게임정답-> handler처리
//    @GetMapping("/result/{room_id}")
//    public GameResult getResult(@PathVariable("room_id") Long roomId) {
//        return gameService.getGameResult(roomId);
//    }
}
