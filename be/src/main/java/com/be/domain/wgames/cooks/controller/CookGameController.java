package com.be.domain.wgames.cooks.controller;

import com.be.domain.wgames.cooks.request.AnswerCorrectRequest;
import com.be.domain.wgames.cooks.response.FoodAnswerResponse;
import com.be.domain.wgames.cooks.response.FoodResponse;
import com.be.domain.wgames.cooks.service.FoodGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/cook-game")
public class CookGameController {

    @Autowired
    private FoodGameService foodGameService;

    @PostMapping("/start-game")
    public ResponseEntity<FoodResponse> startGame() throws IOException {
        log.info("게임 시작 요청 도착");
        FoodResponse foodResponse = foodGameService.pickFood();
        log.info("선택된 음식: {}", foodResponse.getFoodName());
        log.info("아이템 목록: {}", foodResponse.getFoodItems());
        return ResponseEntity.ok(foodResponse);
    }

    @PostMapping("/is-correct")
    public ResponseEntity<FoodAnswerResponse> isCorrect(@ModelAttribute AnswerCorrectRequest request) throws IOException {
        log.info("여기 왔음!");
        log.info("Food Name: {}", request.getFoodName());
        log.info("Item1: {}", request.getItem1());
        log.info("Item2: {}", request.getItem2());

        FoodAnswerResponse answerResponse = foodGameService.isCorrect(request);
        return ResponseEntity.ok(answerResponse);
    }
}
