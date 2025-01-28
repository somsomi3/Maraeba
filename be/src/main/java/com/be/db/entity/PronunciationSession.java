package com.be.db.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PronunciationSession extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne
	@JoinColumn(name = "class_id")
	private PronunciationClass pronunciationClass;

	@Column(nullable = false)
	private Integer sessionNo;

	// 관계
	@OneToMany(mappedBy = "pronunciationSession")
	private List<PronunciationRecord> pronunciationRecords;
	
	@OneToMany(mappedBy = "pronunciationSession")
	private List<PronunciationCompletedClass> pronunciationCompletedClasses;
}
