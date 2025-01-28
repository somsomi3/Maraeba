package com.be.db.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PronunciationCompletedClass extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "class_id")
	private PronunciationClass pronunciationClass;

	@ManyToOne
	@JoinColumn(name = "session_id")
	private PronunciationSession pronunciationSession;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@Column(nullable = false)
	private Float accuracy;
}

