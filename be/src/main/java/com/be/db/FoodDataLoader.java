package com.be.db;

import com.be.db.entity.FoodGame;
import com.be.db.entity.FoodItem;
import com.be.db.repository.FoodGameRepository;
import com.be.db.repository.FoodItemRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FoodDataLoader {

    @Autowired
    private FoodGameRepository foodGameRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @PostConstruct
    public void init() {
        System.out.println("데이터 저장!");
        if (foodItemRepository.count() == 0) {
            FoodItem foodItem1 = FoodItem.builder()
                    .ingredientName("사과").build();

            FoodItem foodItem2 = FoodItem.builder()
                    .ingredientName("파이 반죽").build();
            foodItemRepository.save(foodItem1);
            foodItemRepository.save(foodItem2);

            foodItemRepository.save(FoodItem.builder().ingredientName("감자").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("기름").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("우유").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("밀가루").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("당근").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("고기").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("빵가루").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("부추").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("딸기").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("꿀").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("면").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("설탕").build());
        }

        if (foodGameRepository.count() == 0) {
            FoodGame foodGame = FoodGame.builder()
                    .resultImage("이미지 예시 링크")
                    .resultName("사과 파이")
                    .foodItem1(foodItemRepository.findByIngredientName("사과"))
                    .foodItem2(foodItemRepository.findByIngredientName("파이 반죽"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage("이미지 예시 링크")
                    .resultName("감자튀김")
                    .foodItem1(foodItemRepository.findByIngredientName("감자"))
                    .foodItem2(foodItemRepository.findByIngredientName("기름"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage("이미지 예시 링크")
                    .resultName("돈까스")
                    .foodItem1(foodItemRepository.findByIngredientName("빵가루"))
                    .foodItem2(foodItemRepository.findByIngredientName("고기"))
                    .build();
            foodGameRepository.save(foodGame);
        }
    }
}
