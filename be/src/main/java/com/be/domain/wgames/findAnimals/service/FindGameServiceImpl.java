package com.be.domain.wgames.findAnimals.service;

import com.be.db.entity.AnimalGame;
import com.be.db.repository.AnimalCorrectRepository;
import com.be.db.repository.AnimalGameRepository;
import com.be.domain.wgames.AiTest;
import com.be.domain.wgames.AudioConverter;
import com.be.domain.wgames.findAnimals.request.AnimalCorrectRequest;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;
import com.be.domain.wgames.findAnimals.response.AnimalResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FindGameServiceImpl implements FindGameService {

    private final AnimalGameRepository animalGameRepository;
    private final AnimalCorrectRepository animalCorrectRepository;
    private final AudioConverter convertWebMToWav;
    private final AiTest aiTest;

    // 이미지 데이터를 Base64로 변환
    @Override
    public AnimalResponse pickAnimal() throws IOException {
        AnimalGame animalGame = animalGameRepository.findRandomAnimalGame();
        File imageFile = new File(animalGame.getImage());

        // 1️⃣ 파일을 읽고 바이트 배열로 변환
        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());

        // 2️⃣ Base64 인코딩 추가 (변경된 부분)
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        // 3️⃣ Base64 인코딩된 데이터를 응답에 포함
        AnimalResponse animalResponse = new AnimalResponse();
        animalResponse.setImageNumber(animalGame.getId());
        animalResponse.setImageData(base64Image); // Base64로 변환된 이미지 사용

        return animalResponse;
    }

    @Override
    public AnimalAnswerResponse isCorrect(AnimalCorrectRequest request) throws IOException {
        AnimalAnswerResponse response = new AnimalAnswerResponse();
        MultipartFile animalAudio = request.getAudio();
        int imageNumber = request.getImageNumber();
        List<String> answerList = request.getAnswerList();    //이미 맞춘 정답

        log.info("이미 맞춘 정답 리스트");
        if (answerList != null) {
            for (String s : answerList) {
                log.info("{}", s);

            }
        } else log.info("비었음");

        // 저장 경로 및 파일 이름 설정
        String uploadDir = "C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\audio\\";
        String fileName = animalAudio.getOriginalFilename(); // 원본 파일명 가져오기

        // 파일 저장 경로 설정
        String fullPathName = uploadDir + fileName;

        // 파일을 바이너리 형식으로 저장
        byte[] bytes = animalAudio.getBytes();
        File destFile = new File(fullPathName + ".webm");

        try (FileOutputStream fos = new FileOutputStream(destFile)) {
            fos.write(bytes);
        }

        //webm에서 wav로 인코딩
        convertWebMToWav.convertWebMToWav(fullPathName + ".webm", fullPathName + ".wav");
        String text = aiTest.speechToText(new FileSystemResource(fullPathName + ".wav"));

        log.info("입력된 음성: {}", text);

        //이미 정답을 맞춘 경우 (중복)
        if (answerList != null && answerList.contains(text)) {
            response.setDuplication(true);
            return response;
        }

        //정답을 맞춘 경우
        List<String> list = animalCorrectRepository.findAnimalNamesByGameId(imageNumber);
        log.info("사이즈: {}", list.size());
        for (String s : list) {
            log.info("{}", s);
        }
        if (list.contains(text)) {
            response.setIfCorrect(true);
            response.setAnimalName(text);
            List<Object[]> location = animalCorrectRepository.findLocationByAnimalNameAndGameId(text, imageNumber);
            response.setX((Integer) location.get(0)[0]);
            response.setY((Integer) location.get(0)[1]);

            if (answerList != null) {
                response.setCnt(answerList.size() + 1);
            } else response.setCnt(1);
            return response;
        }

        //정답에 없는 경우
        else {
            response.setIfCorrect(false);
            return response;
        }
    }
}
