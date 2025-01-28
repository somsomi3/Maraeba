package com.be.domain.wgames.service;

import com.be.domain.wgames.request.AnswerCorrectRequest;
import com.be.domain.wgames.response.AnswerResponse;
import com.be.domain.wgames.response.FoodResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FoodGameService {
    FoodResponse pickFood();
    AnswerResponse isCorrect(AnswerCorrectRequest answerCorrectRequest) throws IOException;
}
