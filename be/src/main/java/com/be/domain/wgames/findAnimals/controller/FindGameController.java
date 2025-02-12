package com.be.domain.wgames.findAnimals.controller;

import com.be.domain.wgames.findAnimals.request.AnimalCorrectRequest;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;
import com.be.domain.wgames.findAnimals.response.AnimalResponse;
import com.be.domain.wgames.findAnimals.service.FindGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("wgames/find-animal")
public class FindGameController {

    @Autowired
    private FindGameService findGameService;

    @GetMapping("/start-game")
    public ResponseEntity<AnimalResponse> startGame() throws IOException {
        AnimalResponse animalResponse = findGameService.pickAnimal();
        return ResponseEntity.ok(animalResponse);
    }

    @PostMapping("/is-correct")
    public ResponseEntity<AnimalAnswerResponse> isCorrect(@ModelAttribute AnimalCorrectRequest request) throws IOException {
        AnimalAnswerResponse answerResponse = findGameService.isCorrect(request);
        return ResponseEntity.ok(answerResponse);
    }
}
