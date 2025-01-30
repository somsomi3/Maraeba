package com.be.domain.session.controller;

import com.be.domain.session.request.UserChoiceRequest;
import com.be.domain.session.response.GameResult;
import com.be.domain.session.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
public class GameController {
    @Autowired
    private GameService gameService;

    @PostMapping("/start/{session_id}")
    public String startGame(@PathVariable("session_id") Long sessionId) {
        return gameService.startGame(sessionId);
    }

    @PostMapping("/choice/{session_id}")
    public String chooseOption(@PathVariable("session_id") Long sessionId, @RequestBody UserChoiceRequest request) {
        return gameService.chooseOption(request.getUserId(), sessionId, request.getChoice());
    }

    @GetMapping("/result/{session_id}")
    public GameResult getResult(@PathVariable("session_id") Long sessionId) {
        return gameService.getGameResult(sessionId);
    }
}
