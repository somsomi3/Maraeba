package com.be.domain.prons.dto;

import java.io.Serializable;
import java.util.HashMap;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class PronunciationSessionDTO implements Serializable {
	private String id;   // 세션 ID
	private Long userId;        // 사용자 ID
	private Long classId;      // 수업 ID
	private int tryCount = 0;        // 시도 횟수
	private int correctCount = 0;    // 맞힌 횟수
	private HashMap<Long, Integer> correctMap = new HashMap<>();    // 특정 발음 정답 여부

	public PronunciationSessionDTO(String id, Long userId, Long classId) {
		this.id = id;
		this.userId = userId;
		this.classId = classId;
	}
}
