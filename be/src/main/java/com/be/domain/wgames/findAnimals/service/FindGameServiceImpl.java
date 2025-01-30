package com.be.domain.wgames.findAnimals.service;

import com.be.db.entity.AnimalGame;
import com.be.db.repository.AnimalCorrectRepository;
import com.be.db.repository.AnimalGameRepository;
import com.be.domain.wgames.AudioConverter;
import com.be.domain.wgames.cooks.service.ClovaSpeechClient;
import com.be.domain.wgames.findAnimals.request.AnimalCorrectRequest;
import com.be.domain.wgames.findAnimals.response.AnimalAnswerResponse;
import com.be.domain.wgames.findAnimals.response.AnimalResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FindGameServiceImpl implements FindGameService {

    private final AnimalGameRepository animalGameRepository;
    private final AnimalCorrectRepository animalCorrectRepository;
    private final ClovaSpeechClient speechClient;
    private final AudioConverter convertWebMToWav;

    @Override
    public AnimalResponse pickAnimal() throws IOException {

        // 1. AnimalGame에서 랜덤으로 1개의 엔티티 가져오기
        AnimalGame animalGame = animalGameRepository.findRandomAnimalGame();

        // 2. 가져온 엔티티에서 루트로 이미지 가져온 후 byte[]로 변환
        File imageFile = new File(animalGame.getImage());
        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());

        // 3. response 생성 후 반환
        AnimalResponse animalResponse = new AnimalResponse();
        animalResponse.setImageData(imageBytes);


        return animalResponse;
    }

    @Override
    public AnimalAnswerResponse isCorrect(AnimalCorrectRequest request) throws IOException {
        AnimalAnswerResponse response = new AnimalAnswerResponse();
        MultipartFile animalAudio = request.getAudio();
        int imageNumber = request.getImageNumber();
        List<String> answerList = request.getAnswerList();    //이미 맞춘 정답

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

        // 저장된 파일을 다시 File 객체로 불러오기
        File audioFile = new File(fullPathName + ".wav");

        try {
            AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(audioFile);
            System.out.println("File Format: " + fileFormat.getType());
        } catch (UnsupportedAudioFileException e) {
            System.out.println("Invalid audio file format");
        }

        // ClovaSpeechClient 사용하여 처리
        ClovaSpeechClient.Diarization diarization = new ClovaSpeechClient.Diarization();
        diarization.setEnable(false); // 화자 감지 활성화 (안하면 오류남)
        ClovaSpeechClient.NestRequestEntity nestRequestEntity = new ClovaSpeechClient.NestRequestEntity();
        nestRequestEntity.setDiarization(diarization);
        String result = speechClient.upload2(audioFile, nestRequestEntity);
        System.out.println("Clova Speech API 결과: " + result);

        //장문 API
//        // JSON 파싱 및 "text" 필드 추출
//        ObjectMapper objectMapper = new ObjectMapper();
//        JsonNode rootNode = objectMapper.readTree(result); // JSON 문자열 파싱
//        String text = rootNode.path("segments").get(0).path("text").asText(); // 첫 번째 segment의 "text"

        //단문 API
        // JSON 파싱 및 "text" 필드 추출
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result); // JSON 문자열 파싱
        String text = rootNode.path("text").asText(); // "text" 필드 추출

        System.out.println("입력된 음성: " + text);


        //이미 정답을 맞춘 경우 (중복)
        if (answerList.contains(text)) {
            response.setDuplication(true);
            return response;
        }

        //정답을 맞춘 경우
        List<String> list = animalCorrectRepository.findAnimalNamesByGameId(imageNumber);
        if (list.contains(text)) {
            response.setIfCorrect(true);
            response.setAnimalName(text);
            response.setCnt(answerList.size());
            return response;
        }

        //정답에 없는 경우
        else {
            response.setIfCorrect(false);
            return response;
        }
    }
}
