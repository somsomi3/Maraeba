package com.be.domain.wgames;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AudioConverter {

    /**
     * WebM 파일을 WAV 파일로 변환
     * @throws IOException 변환 중 예외 발생 시
     */
    public void convertWebMToWav(String inputFile, String outputFile) throws IOException {
        // FFmpeg 실행 파일의 절대 경로를 지정
        String ffmpegPath = "C:\\utilities\\ffmpeg\\bin\\ffmpeg.exe"; // Windows의 경우
        // String ffmpegPath = "/usr/bin/ffmpeg";   // Linux/Mac의 경우

        // FFmpeg 명령어에 -y 옵션 추가 (파일 덮어쓰기)
        ProcessBuilder processBuilder = new ProcessBuilder(
                ffmpegPath, "-y", "-i", inputFile, outputFile
        );


        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        // 로그 출력 확인
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.info("{}", line);
            }
        }

        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IOException("FFmpeg 실행 중 오류 발생: 종료 코드 " + exitCode);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("FFmpeg 프로세스가 중단되었습니다.", e);
        }
    }

}
