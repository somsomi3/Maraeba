package com.be.domain.rooms.service;

import com.be.db.entity.ColorItem;
import com.be.db.repository.ColorItemRepository;
import com.be.domain.rooms.response.GetColorListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ColorItemService {

    private final ColorItemRepository colorItemRepository;

    // 새로운 색상 아이템 저장
    public ColorItem saveColorItem(ColorItem colorItem) {
        return colorItemRepository.save(colorItem);
    }

    // 특정 색상별로 하나의 데이터 가져오기
    public Optional<ColorItem> getOneColorItem(String color) {
        return colorItemRepository.findRandomByColor(color);
    }

    // 특정 색상의 모든 데이터 가져오기
    public List<ColorItem> getColorItemsByColor(String color) {
        return colorItemRepository.findByColor(color);
    }

    // 모든 데이터 가져오기
    public List<ColorItem> getAllColorItems() {
        return colorItemRepository.findAll();
    }

    public GetColorListResponse getAllColorItemsByColor(String color) {
        String[] colors = {"red", "orange", "yellow", "green", "blue", "purple"};
        Map<String, Boolean> colorList = new HashMap<>();

        for (String c : colors) {
            colorItemRepository.findRandomByColor(c)
                    .ifPresent(item -> colorList.put(item.getName(), item.getColor().equals(color)));
        }

        return GetColorListResponse.of(colorList);
    }

}
