package com.be.domain.wgames.cooks.common.service;

import com.be.domain.wgames.AiTest;
import com.be.domain.wgames.AudioConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechServiceImpl implements SpeechService{
    private final AudioConverter audioConverter; // AudioConverter 의존성 추가
    private final AudioConverter convertWebMToWav;
    private final AiTest aiTest;

    @Override
    public String EncodingFile(MultipartFile audio) throws IOException {
        // 저장 경로 및 파일 이름 설정
        String uploadDir = "C:\\Users\\SSAFY\\Desktop\\S12P11E104\\be\\src\\main\\resources\\audio";
        String fileName = UUID.randomUUID().toString();

        //파일 저장 경로 설정
        String fullPathName = uploadDir + fileName + ".webm";

        //파일을 바이너리 형식으로 저장
        byte[] bytes = audio.getBytes();
        File destFile = new File(fullPathName);

        try (FileOutputStream fos = new FileOutputStream(destFile)) {
            fos.write(bytes);
            fos.flush();
        }   catch (IOException e) {
            throw new IOException("❌ 음성 파일 저장 실패: " + fullPathName, e);
        }

        //webm에서 wav로 인코딩
//        convertWebMToWav.convertWebMToWav(fullPathName + ".webm", fullPathName + ".wav");
//        return fullPathName + ".wav";
        // 🔴 convertWebMToWav 메서드 수정
        String wavPath = uploadDir + fileName + ".wav";
        audioConverter.convertWebMToWav(fullPathName, wavPath); // AudioConverter 메서드 호출

        return wavPath;
    }

    @Override
    public String SpeechToText(MultipartFile audio) throws IOException {
        String fullPathName = EncodingFile(audio);
        String text = aiTest.speechToText(new FileSystemResource(fullPathName));
        log.info("입력된 음성: {}", text);

        return text;
    }

}
