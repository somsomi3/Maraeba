package com.be.domain.session.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameResult {
    private Long sessionId;
    private String correctAnswer;
    private boolean isUserCorrect;

    //@AllArgsConstructor 사용
//    public GameResult(Long sessionId, String correctAnswer, boolean isUserCorrect) {
//        this.sessionId = sessionId;
//        this.correctAnswer = correctAnswer;
//        this.isUserCorrect = isUserCorrect;
//    }
}