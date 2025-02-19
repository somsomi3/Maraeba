package com.be.domain.rooms.controller;

import java.io.IOException;
import java.util.Map;

import com.be.domain.wgames.common.service.SpeechService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.be.db.entity.Room;
import com.be.db.repository.RoomRepository;
import com.be.domain.rooms.request.UserJoinRequest;
import com.be.domain.rooms.response.GameStartResponse;
import com.be.domain.rooms.service.ColorItemService;

import lombok.AllArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@RestController
@AllArgsConstructor
@RequestMapping("/rgames")
public class GameController {

    private final RoomRepository roomRepository;
    private final ColorItemService colorItemService;
    private final SpeechService speechService;

    //게임 아이템 목록 가져오기
    @GetMapping("/item")
    public ResponseEntity
            <Map<String, String>> getGameItems() {

        return ResponseEntity.status(200).body(colorItemService.getRandomWordsByColor());
    }


    @PostMapping("/start/{room_id}")
    public ResponseEntity<GameStartResponse> startGame(
        @PathVariable("room_id") Long roomId,
        @RequestBody UserJoinRequest request) {

        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isHost = room.getHost().getId().equals(request.getUserId()); // 현재 사용자가 방장인지 확인

        return ResponseEntity.ok(new GameStartResponse(roomId, isHost));
    }

    @PostMapping("/upload-voice/{room_id}")
    public ResponseEntity<String> uploadVoice(
            @PathVariable("room_id") Long roomId,
            @RequestParam("audio") MultipartFile audio) {
        try {
            String transcript = speechService.SpeechToText(audio);
            System.out.println("🎙️ AI 변환 결과!!!: " + transcript);

            return ResponseEntity.ok(transcript);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("음성 처리 중 오류 발생");
        }
    }
}
