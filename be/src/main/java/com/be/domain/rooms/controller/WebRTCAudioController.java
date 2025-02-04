package com.be.domain.rooms.controller;

import com.be.domain.rooms.Aihi;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/webrtc/audio")
public class WebRTCAudioController {

	private final Aihi aihi;

	public WebRTCAudioController(Aihi aiHi) {
		this.aihi = aiHi;
	}

	// ✅ WebRTC에서 녹음된 오디오 파일을 받아서 저장하고, AI 서버로 전송하는 API
	@PostMapping("/stt")
	public ResponseEntity<Map<String, String>> handleAudioUpload(@RequestParam("file") MultipartFile file) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "파일이 비어 있습니다."));
		}

		try {
			// ✅ 오디오 파일 저장 경로 (uploads 폴더 내부에 저장)
			String uploadDir = System.getProperty("user.dir") + "/uploads/";
			File uploadFolder = new File(uploadDir);
			if (!uploadFolder.exists()) {
				uploadFolder.mkdirs();
			}

			// ✅ 파일 저장
			File audioFile = new File(uploadDir + "audio.wav");
			file.transferTo(audioFile);
			System.out.println("✅ 오디오 파일 저장 완료: " + audioFile.getAbsolutePath());

			// ✅ STT 변환 실행
			FileSystemResource fileResource = new FileSystemResource(audioFile);
			String transcript = aihi.speechToText(fileResource);

			// ✅ 결과 반환
			Map<String, String> response = new HashMap<>();
			response.put("message", "✅ STT 변환 성공");
			response.put("transcript", transcript);
			return ResponseEntity.ok(response);

		} catch (IOException e) {
			return ResponseEntity.internalServerError().body(Map.of("error", "❌ 서버 오류: " + e.getMessage()));
		}
	}
}
