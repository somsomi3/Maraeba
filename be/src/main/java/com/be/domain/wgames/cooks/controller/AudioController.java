package com.be.domain.wgames.cooks.controller;

import com.be.domain.wgames.AudioConverter;
import com.be.domain.wgames.cooks.service.ClovaSpeechClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.FileOutputStream;

@RestController
@RequestMapping("/api")
public class AudioController {

    @Autowired
    ClovaSpeechClient speechClient;

    @Autowired
    AudioConverter convertWebMToWav;

    private static final String UPLOAD_DIR = "/path/to/save/audio/";

    @PostMapping("/upload-audio")
    public void uploadAudio(@RequestParam("audio") MultipartFile audio) throws Exception {
        System.out.println("요청 옴");

        String extension = StringUtils.getFilenameExtension(audio.getOriginalFilename());
        System.out.println(extension);

        // 저장 경로 및 파일 이름 설정
        String uploadDir = "C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\audio\\";
        String fileName = audio.getOriginalFilename(); // 원본 파일명 가져오기

        // 파일 확장자 확인
        String fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

//        // mp3로 변환이 필요한 경우 처리
//        if (!"wav".equals(fileExtension)) {
//            System.out.println("wav 형식만 허용됩니다.");
//            return;
//        }

        // 파일 저장 경로 설정
        String fullPathName = uploadDir + fileName;

        System.out.println("Content Type: " + audio.getContentType());

        // 파일을 바이너리 형식으로 저장
        byte[] bytes = audio.getBytes();
        File destFile = new File(fullPathName + ".webm");

        try (FileOutputStream fos = new FileOutputStream(destFile)) {
            fos.write(bytes);
        }

        System.out.println("파일 저장 완료: " + fullPathName);

        convertWebMToWav.convertWebMToWav(fullPathName + ".webm", fullPathName + ".wav");

        System.out.println("여기까진 됨");
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
        diarization.setEnable(false); // 화자 감지 활성화
        ClovaSpeechClient.NestRequestEntity nestRequestEntity = new ClovaSpeechClient.NestRequestEntity();
        nestRequestEntity.setDiarization(diarization);
        String result = speechClient.upload(audioFile, nestRequestEntity);
        System.out.println("Clova Speech API 결과: " + result);

        // JSON 파싱 및 "text" 필드 추출
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result); // JSON 문자열 파싱
        String extractedText = rootNode.path("segments").get(0).path("text").asText(); // 첫 번째 segment의 "text"

        System.out.println("추출된 텍스트: " + extractedText);
    }


}