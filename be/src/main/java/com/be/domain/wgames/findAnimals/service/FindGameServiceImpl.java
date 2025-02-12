package com.be.domain.wgames.findAnimals.service;

import com.be.db.entity.AnimalGame;
import com.be.db.repository.AnimalCorrectRepository;
import com.be.db.repository.AnimalGameRepository;
import com.be.domain.wgames.common.service.SpeechService;
import com.be.domain.wgames.findAnimals.request.AnimalCorrectRequest;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;
import com.be.domain.wgames.findAnimals.response.AnimalResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FindGameServiceImpl implements FindGameService {

    private final AnimalGameRepository animalGameRepository;
    private final AnimalCorrectRepository animalCorrectRepository;
    private final SpeechService speechService;

    // 이미지 데이터를 Base64로 변환
    @Override
    public AnimalResponse pickAnimal() throws IOException {
        AnimalGame animalGame = animalGameRepository.findRandomAnimalGame();

        AnimalResponse animalResponse = new AnimalResponse();
        animalResponse.setImageNumber(animalGame.getId());
        animalResponse.setImageUrl(animalGame.getImage());

        return animalResponse;
    }

    @Override
    public AnimalAnswerResponse isCorrect(AnimalCorrectRequest request) throws IOException {
        AnimalAnswerResponse response = new AnimalAnswerResponse();
        MultipartFile audio = request.getAudio();
        int imageNumber = request.getImageNumber();
        List<String> answerList = request.getAnswerList();    //이미 맞춘 정답
        answerList.replaceAll(s -> s.replaceAll(" ", ""));
        //음성인식 결과
        String text = speechService.SpeechToText(audio);
        System.out.println(text);

        //이미 정답을 맞춘 경우 (중복)
        if (answerList.contains(text)) {
            response.setDuplication(true);
            return response;
        }

        //정답을 맞춘 경우
        //해당 게임의 정답 리스트 불러옴
        List<String> list = animalCorrectRepository.findAnimalNamesByGameId(imageNumber);

        if (list.stream().map(s -> s.replaceAll(" ", ""))
                .toList().contains(text)) {
            response.setIfCorrect(true);
            response.setAnimalName(text);
            List<Object[]> location = animalCorrectRepository.findLocationByAnimalNameAndGameId(text, imageNumber);
            response.setX((Integer) location.get(0)[0]);
            response.setY((Integer) location.get(0)[1]);

            response.setCnt(answerList.size() + 1);
        }
        //정답에 없는 경우
        else {
            response.setIfCorrect(false);
        }
        return response;
    }
}
