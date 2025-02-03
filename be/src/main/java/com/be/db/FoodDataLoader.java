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
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("사과")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\사과.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("파이 반죽")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\파이 반죽.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("감자")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\감자.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("기름")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\기름.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("빵")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\빵.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("야채")
                    .foodImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodItemImg\\야채.png")
                    .build());
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
                    .resultImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodImg\\사과 파이.png")
                    .resultName("사과 파이")
                    .foodItem1(foodItemRepository.findByIngredientName("사과"))
                    .foodItem2(foodItemRepository.findByIngredientName("파이 반죽"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodImg\\감자튀김.png")
                    .resultName("감자튀김")
                    .foodItem1(foodItemRepository.findByIngredientName("감자"))
                    .foodItem2(foodItemRepository.findByIngredientName("기름"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\foodImg\\샌드위치.png")
                    .resultName("샌드위치")
                    .foodItem1(foodItemRepository.findByIngredientName("빵"))
                    .foodItem2(foodItemRepository.findByIngredientName("야채"))
                    .build();
            foodGameRepository.save(foodGame);
        }
    }
}
