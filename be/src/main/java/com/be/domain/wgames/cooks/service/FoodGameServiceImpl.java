package com.be.domain.wgames.cooks.service;

import com.be.db.entity.FoodGame;
import com.be.db.repository.FoodGameRepository;
import com.be.db.repository.FoodItemRepository;
import com.be.domain.wgames.AiTest;
import com.be.domain.wgames.common.service.SpeechService;
import com.be.domain.wgames.cooks.request.AnswerCorrectRequest;
import com.be.domain.wgames.cooks.response.FoodAnswerResponse;
import com.be.domain.wgames.cooks.response.FoodResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodGameServiceImpl implements FoodGameService {

    private final FoodGameRepository foodGameRepository;
    private final FoodItemRepository foodItemRepository;
    private final AiTest aiTest;
    private final SpeechService speechService;

    @Override
    public FoodResponse pickFood() throws IOException {

        // 1. FoodGame에서 랜덤으로 1개의 엔티티 가져오기
        FoodGame foodGame = foodGameRepository.findRandomFoodGame();

        // 2. FoodGame에서 선택된 2개의 FoodItem 가져오기
        String item1 = foodGame.getFoodItem1().getIngredientName();
        String item2 = foodGame.getFoodItem2().getIngredientName();

        // 3. FoodItem에서 랜덤으로 6개의 이름 가져오기
        List<String> randomItems = foodItemRepository.findRandomFoodItems(6, item1, item2);

        // 4. 모든 이름을 합쳐 클라이언트로 보낼 데이터 구성
        List<String> allItems = new ArrayList<>();
        allItems.add(item1);
        allItems.add(item2);
        allItems.addAll(randomItems);
        Collections.shuffle(allItems);

        // 65 FoodResponse 생성 후 반환
        FoodResponse foodResponse = new FoodResponse();
        foodResponse.setFoodName(foodGame.getResultName());
        foodResponse.setFoodItems(allItems);
        foodResponse.setImageUrl(foodGame.getResultImage());
        return foodResponse;
    }

    @Override
    public FoodAnswerResponse isCorrect(AnswerCorrectRequest request) throws IOException {
        MultipartFile audio = request.getAudio();
        String alreadyItem = request.getItem1();

        //음성인식 결과
        String text = speechService.SpeechToText(audio);

        //맞춰야 하는 음식 정보 가져옴
        FoodGame food = foodGameRepository.findByResultName(request.getFoodName());
        return answerTo(alreadyItem, food, text);
    }

    @Override
    public FoodAnswerResponse answerTo(String alreadyItem, FoodGame food, String text) throws IOException {
        FoodAnswerResponse answerResponse = new FoodAnswerResponse();

        //현재 문제에서 맞춰야 하는 정답
        String answerItem1 = food.getFoodItem1().getIngredientName();
        String answerItem2 = food.getFoodItem2().getIngredientName();

        //음성인식 결과에서 공백 제거
        String textBlank = text.replaceAll(" ", "");

        //아직 하나도 못 맞춘 경우
        if (alreadyItem == null) {
            //정답인 경우
            if (textBlank.contains(answerItem1.replaceAll(" ", "")) || textBlank.contains(answerItem2.replaceAll(" ", ""))) {
                String answer = textBlank.contains((answerItem1.replaceAll(" ", ""))) ? answerItem1 : answerItem2;
                answerResponse.setIfCorrect(true);
                answerResponse.setItem(answer);
                answerResponse.setCnt(1);

                //가져온 엔티티에서 루트로 이미지 Url 가져온 후 반환
                answerResponse.setImageUrl(foodItemRepository.findByIngredientName(answer).getFoodImage());
            }
            //정답이 아닌 경우
            else {
                answerResponse.setItem(text);
                answerResponse.setIfCorrect(false);
                answerResponse.setDuplication(false);
            }
        }
        //1번은 맞춘 경우
        else {
            //이미 1번에서 맞춘거임. 중복
            if (textBlank.contains(alreadyItem.replaceAll(" ", ""))) {
                answerResponse.setItem(text);
                answerResponse.setDuplication(true);
            }
            //중복 아니고 정답 맞음.
            else if (textBlank.contains(answerItem1.replaceAll(" ", "")) || textBlank.contains(answerItem2.replaceAll(" ", ""))) {
                answerResponse.setIfCorrect(true);
                String answer = textBlank.contains(answerItem1.replaceAll(" ", "")) ? answerItem1 : answerItem2;
                answerResponse.setItem(answer);
                answerResponse.setCnt(2);

                //가져온 엔티티에서 루트로 이미지 Url 가져온 후 반환
                answerResponse.setImageUrl(foodItemRepository.findByIngredientName(answer).getFoodImage());
            }
            //정답이 아닌 경우
            else {
                answerResponse.setItem(text);
                answerResponse.setIfCorrect(false);
                answerResponse.setDuplication(false);
            }
        }

        return answerResponse;
    }
}
