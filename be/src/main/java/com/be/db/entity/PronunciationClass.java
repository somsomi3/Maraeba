package com.be.db.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PronunciationClass extends BaseEntity {

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false)
	private Integer pronunciationCnt;

	// 관계
	@OneToMany(mappedBy = "pronunciationClass")
	private List<PronunciationSession> pronunciationSessions;

	@OneToMany(mappedBy = "pronunciationClass")
	private List<PronunciationData> pronunciationDatas;

	@OneToMany(mappedBy = "pronunciationClass")
	private List<PronunciationCompletedClass> pronunciationCompletedClasses;
}
