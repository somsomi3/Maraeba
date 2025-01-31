package com.be.domain.rooms.controller;

import com.be.domain.rooms.request.UserChoiceRequest;
import com.be.domain.rooms.response.GameResult;
import com.be.domain.rooms.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
public class GameController {
    @Autowired
    private GameService gameService;

    @PostMapping("/start/{room_id}")
    public String startGame(@PathVariable("room_id") Long roomId) {
        return gameService.startGame(roomId);
    }

    @PostMapping("/choice/{room_id}")
    public String chooseOption(@PathVariable("room_id") Long roomId, @RequestBody UserChoiceRequest request) {
        return gameService.chooseOption(request.getUserId(), roomId, request.getChoice());
    }

    @GetMapping("/result/{room_id}")
    public GameResult getResult(@PathVariable("room_id") Long roomId) {
        return gameService.getGameResult(roomId);
    }
}
