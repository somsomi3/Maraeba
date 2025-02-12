package com.be.db;

import com.be.db.entity.*;
import com.be.db.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;

@Slf4j
@Component
public class AnimalDataLoader {
    @Autowired
    private AnimalGameRepository animalGameRepository;

    @Autowired
    private AnimalListRepository animalListRepository;

    @Autowired
    private AnimalCorrectRepository animalCorrectRepository;

    @PostConstruct
    public void init() {

        String url = "/img";
//        String url = "C:\\Users\\SSAFY\\Desktop\\S12P11E104\\be\\src\\main\\resources";
//        String url = "C:\\Users\\lsh95\\Desktop\\S12P11E104\\be\\src\\main\\resources";

        log.info(" 데이터 저장!");

        // 1️⃣ animal_game 테이블에 ID=1인 데이터 추가
        AnimalGame animalGame = animalGameRepository.findById(1).orElseGet(() ->
                animalGameRepository.save(AnimalGame.builder()
                        .image(url + "/image.png")
                        .build()));

        // 2️⃣ animal_list 테이블에 3개의 동물 추가
        if (animalListRepository.count() == 0) {
            List<AnimalList> animalLists = List.of(
                    AnimalList.builder().animalName("사슴").animalImage("임시.png").build(),
                    AnimalList.builder().animalName("토끼").animalImage("임시.png").build(),
                    AnimalList.builder().animalName("여우").animalImage("임시.png").build(),
                    AnimalList.builder().animalName("고슴도치").animalImage("임시.png").build(),
                    AnimalList.builder().animalName("너구리").animalImage("임시.png").build(),
                    AnimalList.builder().animalName("곰").animalImage("임시.png").build()
            );
            animalListRepository.saveAll(animalLists);
        }

        // 3️⃣ animal_correct 테이블에 정답 데이터 추가 (game_id = 1)
        List<AnimalList> animals = animalListRepository.findAll();
        if (animalCorrectRepository.count() == 0 && !animals.isEmpty()) {
            List<AnimalCorrect> correctAnswers = List.of(
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(0).getId())
                            .locationX(350).locationY(1706).build(),
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(1).getId())
                            .locationX(1136).locationY(2089).build(),
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(2).getId())
                            .locationX(2277).locationY(1985).build(),
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(2).getId())
                            .locationX(3140).locationY(2152).build(),
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(2).getId())
                            .locationX(3404).locationY(1366).build(),
                    AnimalCorrect.builder().gameId(animalGame.getId()).animalId(animals.get(2).getId())
                            .locationX(2729).locationY(1241).build()
            );
            animalCorrectRepository.saveAll(correctAnswers);
        }

        log.info("데이터 저장 완료!");
    }
}
