package com.be.domain.wgames.cooks.service;

import com.be.db.entity.FoodGame;
import com.be.domain.wgames.cooks.request.AnswerCorrectRequest;
import com.be.domain.wgames.cooks.response.FoodAnswerResponse;
import com.be.domain.wgames.cooks.response.FoodResponse;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;

import java.io.IOException;

public interface FoodGameService {
    //게임 시작 시 데이터 불러오기
    FoodResponse pickFood() throws IOException;

    //정답 검증
    FoodAnswerResponse isCorrect(AnswerCorrectRequest answerCorrectRequest) throws IOException;

    //정답 처리
    FoodAnswerResponse answerTo(String alreadyItem, FoodGame food, String text) throws IOException;
}
