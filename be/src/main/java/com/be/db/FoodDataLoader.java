package com.be.db;

import com.be.db.entity.FoodGame;
import com.be.db.entity.FoodItem;
import com.be.db.repository.FoodGameRepository;
import com.be.db.repository.FoodItemRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FoodDataLoader {

    @Autowired
    private FoodGameRepository foodGameRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @PostConstruct
    public void init() {

        log.info("데이터 저장!");
        String itemUrl = "/foodItemImg";
        String foodUrl = "/foodImg";
//        String url = "C:\\Users\\SSAFY\\Desktop\\S12P11E104\\be\\src\\main\\resources";
//        String url = "C:\\Users\\lsh95\\Desktop\\S12P11E104\\be\\src\\main\\resources";

        if (foodItemRepository.count() == 0) {
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("사과")
                    .foodImage(itemUrl + "/사과.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("파이 반죽")
                    .foodImage(itemUrl + "/파이 반죽.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("감자")
                    .foodImage(itemUrl + "/감자.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("기름")
                    .foodImage(itemUrl + "/기름.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("빵")
                    .foodImage(itemUrl + "/빵.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("야채")
                    .foodImage(itemUrl + "/야채.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("딸기")
                    .foodImage(itemUrl + "/딸기.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("케이크 시트")
                    .foodImage(itemUrl + "/케이크 시트.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("밥")
                    .foodImage(itemUrl + "/밥.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("생선 살")
                    .foodImage(itemUrl + "/생선 살.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("우유")
                    .foodImage(itemUrl + "/우유.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("코코아 가루")
                    .foodImage(itemUrl + "/코코아 가루.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("옥수수")
                    .foodImage(itemUrl + "/옥수수.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("버터")
                    .foodImage(itemUrl + "/버터.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("딸기잼")
                    .foodImage(itemUrl + "/딸기잼.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("식빵")
                    .foodImage(itemUrl + "/식빵.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("초콜릿")
                    .foodImage(itemUrl + "/초콜릿.png")
                    .build());
            foodItemRepository.save(FoodItem.builder()
                    .ingredientName("쿠키 반죽")
                    .foodImage(itemUrl + "/쿠키 반죽.png")
                    .build());
            foodItemRepository.save(FoodItem.builder().ingredientName("밀가루").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("당근").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("고기").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("빵가루").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("부추").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("꿀").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("면").build());
            foodItemRepository.save(FoodItem.builder().ingredientName("설탕").build());
        }

        if (foodGameRepository.count() == 0) {
            FoodGame foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/사과 파이.png")
                    .resultName("사과 파이")
                    .foodItem1(foodItemRepository.findByIngredientName("사과"))
                    .foodItem2(foodItemRepository.findByIngredientName("파이 반죽"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/감자튀김.png")
                    .resultName("감자튀김")
                    .foodItem1(foodItemRepository.findByIngredientName("감자"))
                    .foodItem2(foodItemRepository.findByIngredientName("기름"))
                    .build();
            foodGameRepository.save(foodGame);

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/샌드위치.png")
                    .resultName("샌드위치")
                    .foodItem1(foodItemRepository.findByIngredientName("빵"))
                    .foodItem2(foodItemRepository.findByIngredientName("야채"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/딸기 케이크.png")
                    .resultName("딸기 케이크")
                    .foodItem1(foodItemRepository.findByIngredientName("딸기"))
                    .foodItem2(foodItemRepository.findByIngredientName("케이크 시트"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/코코아.png")
                    .resultName("코코아")
                    .foodItem1(foodItemRepository.findByIngredientName("코코아 가루"))
                    .foodItem2(foodItemRepository.findByIngredientName("우유"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/초밥.png")
                    .resultName("초밥")
                    .foodItem1(foodItemRepository.findByIngredientName("밥"))
                    .foodItem2(foodItemRepository.findByIngredientName("생선 살"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/버터맛 팝콘.png")
                    .resultName("버터맛 팝콘")
                    .foodItem1(foodItemRepository.findByIngredientName("버터"))
                    .foodItem2(foodItemRepository.findByIngredientName("옥수수"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/딸기잼 바른 식빵.png")
                    .resultName("딸기잼 바른 식빵")
                    .foodItem1(foodItemRepository.findByIngredientName("딸기잼"))
                    .foodItem2(foodItemRepository.findByIngredientName("식빵"))
                    .build();

            foodGame = FoodGame.builder()
                    .resultImage(foodUrl + "/초코 쿠키.png")
                    .resultName("초코 쿠키")
                    .foodItem1(foodItemRepository.findByIngredientName("초콜릿"))
                    .foodItem2(foodItemRepository.findByIngredientName("쿠키 반죽"))
                    .build();
            foodGameRepository.save(foodGame);
        }
    }
}
