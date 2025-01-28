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
public class PronunciationData extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "class_id")
	private PronunciationClass pronunciationClass;

	@Column(nullable = false)
	private String pronunciation;

	@Column(nullable = false)
	private String lipVideoUrl;

	@Column(nullable = false)
	private String tongueImageUrl;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false)
	private Integer sequence;

	// 관계
	@OneToMany(mappedBy = "pronunciationData")
	private List<PronunciationRecord> pronunciationRecords;

}
