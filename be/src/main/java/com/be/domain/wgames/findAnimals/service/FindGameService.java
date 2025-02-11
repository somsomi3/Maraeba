package com.be.domain.wgames.findAnimals.service;

import com.be.domain.wgames.findAnimals.request.AnimalCorrectRequest;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;
import com.be.domain.wgames.findAnimals.response.AnimalResponse;

import java.io.IOException;

public interface FindGameService {

    //게임 시작
    AnimalResponse pickAnimal() throws IOException;

    //정답 검증
    AnimalAnswerResponse isCorrect(AnimalCorrectRequest request) throws IOException;

}
