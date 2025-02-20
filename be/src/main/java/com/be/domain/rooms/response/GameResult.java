package com.be.domain.rooms.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
//response는 getter만
@NoArgsConstructor
@AllArgsConstructor
public class GameResult {
    private Long roomId;
    private String correctAnswer;
    private boolean isUserCorrect;

}