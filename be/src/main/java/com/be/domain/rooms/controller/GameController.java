package com.be.domain.rooms.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.GameStartResponse;
import com.be.domain.rooms.service.ColorItemService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/rgames")
public class GameController {

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
}
