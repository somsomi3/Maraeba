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
        System.out.println("맞춰야 할 이미지 번호: " + animalResponse.getImageNumber());
        return ResponseEntity.ok(animalResponse);
    }

    @PostMapping("/is-correct")
    public ResponseEntity<AnimalAnswerResponse> isCorrect(@ModelAttribute AnimalCorrectRequest request) throws IOException {
        System.out.println("여기에 옴!");
        AnimalAnswerResponse answerResponse = findGameService.isCorrect(request);
        System.out.println(answerResponse.getAnimalName());
        return ResponseEntity.ok(answerResponse);
    }
}
