package com.be.domain.wgames.cooks.service;

import com.be.domain.wgames.cooks.request.AnswerCorrectRequest;
import com.be.domain.wgames.cooks.response.FoodAnswerResponse;
import com.be.domain.wgames.cooks.response.FoodResponse;

import java.io.IOException;

public interface FoodGameService {
    FoodResponse pickFood() throws IOException;

    FoodAnswerResponse isCorrect(AnswerCorrectRequest answerCorrectRequest) throws IOException;
}
