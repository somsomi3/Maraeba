package com.be.domain.wgames.cooks.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FoodResponse {
    private String foodName;
    private List<String> foodItems; // 랜덤으로 선택된 아이템 이름 목록
}
