package com.be.db.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class PronunciationHistory extends BaseEntity {

	@Column(nullable = false)
	private String sessionId;

	@ManyToOne
	@JoinColumn(name = "user_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;

	@ManyToOne
	@JoinColumn(name = "class_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private PronunciationClass pronunciationClass;

	@Column(nullable = false)
	private double averageCorrectRate;

	public PronunciationHistory(String sessionId, User user, PronunciationClass pronunciationClass,
		double averageCorrectRate) {
		this.sessionId = sessionId;
		this.user = user;
		this.pronunciationClass = pronunciationClass;
		this.averageCorrectRate = averageCorrectRate;
	}
}

