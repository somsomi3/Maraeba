package com.be.domain.wgames.findAnimals.service;

import com.be.db.entity.AnimalGame;
import com.be.db.repository.AnimalCorrectRepository;
import com.be.db.repository.AnimalGameRepository;
import com.be.domain.wgames.AiTest;
import com.be.domain.wgames.AudioConverter;
import com.be.domain.wgames.cooks.common.service.SpeechService;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FindGameServiceImpl implements FindGameService {

    private final AnimalGameRepository animalGameRepository;
    private final AnimalCorrectRepository animalCorrectRepository;
    private final SpeechService speechService;

    @Override
    public AnimalResponse pickAnimal() throws IOException {

        // 1. AnimalGame에서 랜덤으로 1개의 엔티티 가져오기
        AnimalGame animalGame = animalGameRepository.findRandomAnimalGame();

        // 2. 가져온 엔티티에서 루트로 이미지 가져온 후 byte[]로 변환
        File imageFile = new File(animalGame.getImage());
        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());

        // 3. response 생성 후 반환
        AnimalResponse animalResponse = new AnimalResponse();
        animalResponse.setImageNumber(animalGame.getId());
        animalResponse.setImageData(imageBytes);


        return animalResponse;
    }

    @Override
    public AnimalAnswerResponse isCorrect(AnimalCorrectRequest request) throws IOException {
        AnimalAnswerResponse response = new AnimalAnswerResponse();
        MultipartFile audio = request.getAudio();
        int imageNumber = request.getImageNumber();
        List<String> answerList = request.getAnswerList();    //이미 맞춘 정답

        log.info("이미 맞춘 정답 리스트");
        if (answerList != null) {
            for (String s : answerList) {
                log.info("{}", s);

            }
        } else log.info("비었음");

        //음성인식 결과
        String text = speechService.SpeechToText(audio);

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
