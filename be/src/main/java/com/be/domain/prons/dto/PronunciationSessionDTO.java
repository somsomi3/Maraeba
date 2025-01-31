package com.be.domain.prons.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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
	private Integer progress; // 진행도
	private List<Double> similarities = new ArrayList<>(); // ✅ 발음 유사도 리스트 추가

	public PronunciationSessionDTO(String id, Long userId, Long classId, Integer progress) {
		this.id = id;
		this.userId = userId;
		this.classId = classId;
		this.progress = progress;
	}
}
