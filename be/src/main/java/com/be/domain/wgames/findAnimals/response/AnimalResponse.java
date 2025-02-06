package com.be.domain.wgames.findAnimals.response;


import lombok.Getter;
import lombok.Setter;

//게임 시작 요청 응답 Response
@Getter
@Setter
public class AnimalResponse {
    private int imageNumber;
    private String imageData; // ✅ Base64 문자열 저장 가능
}
