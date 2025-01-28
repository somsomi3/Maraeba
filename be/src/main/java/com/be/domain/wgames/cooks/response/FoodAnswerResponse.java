package com.be.domain.wgames.cooks.response;

import lombok.Getter;
import lombok.Setter;

//정답 검증 Response
@Getter
@Setter
public class FoodAnswerResponse {
    private boolean ifCorrect;  //정답 여부
    private boolean duplication;//중복 여부
    private String item;        //재료 이름
    private int cnt;            //몇번째 재료?
}
