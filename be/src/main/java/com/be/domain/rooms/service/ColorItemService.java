package com.be.domain.rooms.service;

import com.be.db.entity.ColorItem;
import com.be.db.repository.ColorItemRepository;
import com.be.domain.rooms.response.GetColorListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.*;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ColorItemService {

    private final ColorItemRepository colorItemRepository;
    private final Random random = new Random(); // 랜덤 객체

    // 각 색상별로 단어 1개씩 랜덤으로 선택하여 반환
    public Map<String, String> getRandomWordsByColor() {
        List<String> colors = List.of("red", "orange", "yellow", "green", "blue", "purple");
        Map<String, String> randomWords = new LinkedHashMap<>();

        for (String colorKey : colors) {
            List<ColorItem> items = colorItemRepository.findByColor(colorKey); // DB에서 색상별 단어 가져오기

            if (!items.isEmpty()) {
                int randomIndex = random.nextInt(items.size()); // 랜덤 인덱스 선택
//                log.info("색깔={}, 이름={}",colorKey,items.get(randomIndex).getName());
                randomWords.put(colorKey, items.get(randomIndex).getName()); // 해당 색상의 랜덤 단어 선택
            }
        }

        return randomWords; // { "red": "토마토", "orange": "오렌지", "yellow": "레몬", ... }
    }
}
