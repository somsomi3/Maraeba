package com.be.domain.prons.dto;

import java.io.Serializable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PronunciationSessionDTO implements Serializable {
	private String id;   // 세션 ID
	private Long userId;        // 사용자 ID
	private Long classId;      // 수업 ID
	private int tryCount = 0;        // 시도 횟수
	private int correctCount = 0;    // 맞힌 횟수

	public PronunciationSessionDTO(String id, Long userId, Long classId) {
		this.id = id;
		this.userId = userId;
		this.classId = classId;
	}
}
