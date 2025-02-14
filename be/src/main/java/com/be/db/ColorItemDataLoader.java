package com.be.db;

import com.be.db.entity.ColorItem;
import com.be.db.repository.ColorItemRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ColorItemDataLoader {

    private final ColorItemRepository colorItemRepository;

    @PostConstruct
    public void init() {
        if (colorItemRepository.count() == 0) { // 기존 데이터가 없을 때만 추가
            log.info("색상 아이템 데이터 삽입 시작");

            // 빨강색
            colorItemRepository.save(new ColorItem("red", "토마토"));
            colorItemRepository.save(new ColorItem("red", "딸기"));
            colorItemRepository.save(new ColorItem("red", "장미"));
            colorItemRepository.save(new ColorItem("red", "석류"));
            colorItemRepository.save(new ColorItem("red", "비트"));
            colorItemRepository.save(new ColorItem("red", "무당벌레"));
            colorItemRepository.save(new ColorItem("red", "사과"));
            colorItemRepository.save(new ColorItem("red", "체리"));


            // 주황색
            colorItemRepository.save(new ColorItem("orange", "오렌지"));
            colorItemRepository.save(new ColorItem("orange", "감귤"));
            colorItemRepository.save(new ColorItem("orange", "당근"));
            colorItemRepository.save(new ColorItem("orange", "호박"));
            colorItemRepository.save(new ColorItem("orange", "망고"));
            colorItemRepository.save(new ColorItem("orange", "살구"));
            colorItemRepository.save(new ColorItem("orange", "단호박"));
            colorItemRepository.save(new ColorItem("orange", "황토"));
            colorItemRepository.save(new ColorItem("orange", "연어"));

            // 노랑색
            colorItemRepository.save(new ColorItem("yellow", "레몬"));
            colorItemRepository.save(new ColorItem("yellow", "바나나"));
            colorItemRepository.save(new ColorItem("yellow", "카나리아"));
            colorItemRepository.save(new ColorItem("yellow", "개나리"));
            colorItemRepository.save(new ColorItem("yellow", "옥수수"));
            colorItemRepository.save(new ColorItem("yellow", "해바라기"));
            colorItemRepository.save(new ColorItem("yellow", "유채꽃"));
            colorItemRepository.save(new ColorItem("yellow", "치즈"));
            colorItemRepository.save(new ColorItem("yellow", "호밀"));

            // 초록색
            colorItemRepository.save(new ColorItem("green", "청포도"));
            colorItemRepository.save(new ColorItem("green", "대나무"));
            colorItemRepository.save(new ColorItem("green", "에메랄드"));
            colorItemRepository.save(new ColorItem("green", "시금치"));
            colorItemRepository.save(new ColorItem("green", "키위"));
            colorItemRepository.save(new ColorItem("green", "잔디"));
            colorItemRepository.save(new ColorItem("green", "상추"));
            colorItemRepository.save(new ColorItem("green", "녹차"));

            // 파랑색
            colorItemRepository.save(new ColorItem("blue", "바다"));
            colorItemRepository.save(new ColorItem("blue", "하늘"));
            colorItemRepository.save(new ColorItem("blue", "청바지"));
            colorItemRepository.save(new ColorItem("blue", "블루베리"));
            colorItemRepository.save(new ColorItem("blue", "사파이어"));
            colorItemRepository.save(new ColorItem("blue", "파랑새"));

            // 보라색
            colorItemRepository.save(new ColorItem("purple", "라벤더"));
            colorItemRepository.save(new ColorItem("purple", "포도"));
            colorItemRepository.save(new ColorItem("purple", "자수정"));
            colorItemRepository.save(new ColorItem("purple", "라일락"));
            colorItemRepository.save(new ColorItem("purple", "제비꽃"));

            log.info("색상 아이템 데이터 삽입 완료!");
        } else {
            log.info("색상 아이템 데이터가 이미 존재하여 삽입하지 않음.");
        }
    }
}
