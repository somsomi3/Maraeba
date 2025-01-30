package com.be.domain.wgames.findAnimals.response;

import lombok.Getter;
import lombok.Setter;

//정답 검증 Response
@Getter
@Setter
public class AnimalAnswerResponse {
    private boolean ifCorrect;
    private boolean duplication;
    private String animalName;
    private int cnt;
}
