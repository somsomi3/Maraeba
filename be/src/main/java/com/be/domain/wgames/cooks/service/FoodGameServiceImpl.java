package com.be.domain.wgames.cooks.service;

import com.be.db.entity.FoodGame;
import com.be.db.repository.FoodGameRepository;
import com.be.db.repository.FoodItemRepository;
import com.be.domain.wgames.AiTest;
import com.be.domain.wgames.AudioConverter;
import com.be.domain.wgames.cooks.request.AnswerCorrectRequest;
import com.be.domain.wgames.cooks.response.FoodAnswerResponse;
import com.be.domain.wgames.cooks.response.FoodResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodGameServiceImpl implements FoodGameService {

//    private final ClovaSpeechClient speechClient;
    private final AudioConverter convertWebMToWav;
    private final FoodGameRepository foodGameRepository;
    private final FoodItemRepository foodItemRepository;
    private final AiTest aiTest;

    @Override
    public FoodResponse pickFood() throws IOException {

        // 1. FoodGame에서 랜덤으로 1개의 엔티티 가져오기
        FoodGame foodGame = foodGameRepository.findRandomFoodGame();

        // 2. 가져온 엔티티에서 루트로 이미지 가져온 후 byte[] 반환
        File imageFile = new File(foodGame.getResultImage());
        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());

        // 3. FoodGame에서 선택된 2개의 FoodItem 가져오기
        String item1 = foodGame.getFoodItem1().getIngredientName();
        String item2 = foodGame.getFoodItem2().getIngredientName();

        // 4. FoodItem에서 랜덤으로 6개의 이름 가져오기
        List<String> randomItems = foodItemRepository.findRandomFoodItems(6, item1, item2);

        // 5. 모든 이름을 합쳐 클라이언트로 보낼 데이터 구성
        List<String> allItems = new ArrayList<>();
        allItems.add(item1);
        allItems.add(item2);
        allItems.addAll(randomItems);
        Collections.shuffle(allItems);

        // 6. FoodResponse 생성 후 반환
        FoodResponse foodResponse = new FoodResponse();
        foodResponse.setFoodName(foodGame.getResultName());
        foodResponse.setFoodItems(allItems);
        foodResponse.setImageData(imageBytes);
        return foodResponse;
    }

    @Override
    public FoodAnswerResponse isCorrect(AnswerCorrectRequest request) throws IOException {
        FoodAnswerResponse answerResponse = new FoodAnswerResponse();
        MultipartFile audio = request.getAudio();
        String item1 = request.getItem1();
        String item2 = request.getItem2();

        // 저장 경로 및 파일 이름 설정
        String uploadDir = "C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\audio\\";
        String fileName = audio.getOriginalFilename(); // 원본 파일명 가져오기

        // 파일 저장 경로 설정
        String fullPathName = uploadDir + fileName;

        // 파일을 바이너리 형식으로 저장
        byte[] bytes = audio.getBytes();
        File destFile = new File(fullPathName + ".webm");

        try (FileOutputStream fos = new FileOutputStream(destFile)) {
            fos.write(bytes);
        }

        //webm에서 wav로 인코딩
        convertWebMToWav.convertWebMToWav(fullPathName + ".webm", fullPathName + ".wav");
        String text = aiTest.speechToText(new FileSystemResource(fullPathName + ".wav"));

//        // 저장된 파일을 다시 File 객체로 불러오기
//        File audioFile = new File(fullPathName + ".wav");
//
//        // ClovaSpeechClient 사용하여 처리
//        ClovaSpeechClient.Diarization diarization = new ClovaSpeechClient.Diarization();
//        diarization.setEnable(false); // 화자 감지 활성화 (안하면 오류남)
//        ClovaSpeechClient.NestRequestEntity nestRequestEntity = new ClovaSpeechClient.NestRequestEntity();
//        nestRequestEntity.setDiarization(diarization);
//        String result = speechClient.upload2(audioFile, nestRequestEntity);
//        System.out.println("Clova Speech API 결과: " + result);

        //장문 API
//        // JSON 파싱 및 "text" 필드 추출
//        ObjectMapper objectMapper = new ObjectMapper();
//        JsonNode rootNode = objectMapper.readTree(result); // JSON 문자열 파싱
//        String text = rootNode.path("segments").get(0).path("text").asText(); // 첫 번째 segment의 "text"

//        //단문 API
//        // JSON 파싱 및 "text" 필드 추출
//        ObjectMapper objectMapper = new ObjectMapper();
//        JsonNode rootNode = objectMapper.readTree(result); // JSON 문자열 파싱
//        String text = rootNode.path("text").asText(); // "text" 필드 추출
//
        System.out.println("입력된 음성: " + text);

        FoodGame food = foodGameRepository.findByResultName(request.getFoodName());
        String answerItem1 = food.getFoodItem1().getIngredientName();
        String answerItem2 = food.getFoodItem2().getIngredientName();
        //아직 하나도 못 맞춘 경우
        if (item1 == null) {
            //정답인 경우
            if (text.contains(answerItem1) || text.contains(answerItem2)) {
                String answer = text.contains((answerItem1)) ? answerItem1 : answerItem2;
                answerResponse.setIfCorrect(true);
                answerResponse.setItem(answer);
                answerResponse.setCnt(1);

                //가져온 엔티티에서 루트로 이미지 가져온 후 byte[] 반환
                File imageFile = new File(foodItemRepository.findByIngredientName(text).getFoodImage());
                byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
                answerResponse.setImageData(imageBytes);
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
            if (text.contains(item1)) {
                answerResponse.setItem(text);
                answerResponse.setDuplication(true);
            }
            //중복 아니고 정답 맞음.
            else if (text.contains(answerItem1) || text.contains(answerItem2)) {
                answerResponse.setIfCorrect(true);
                answerResponse.setItem(text.contains(answerItem1) ? answerItem1 : answerItem2);
                answerResponse.setCnt(2);
                //가져온 엔티티에서 루트로 이미지 가져온 후 byte[] 반환
                File imageFile = new File(foodItemRepository.findByIngredientName(text).getFoodImage());
                byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
                answerResponse.setImageData(imageBytes);
            }
        }
        return answerResponse;
    }
}
