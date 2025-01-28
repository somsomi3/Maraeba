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
public class PronunciationRecord extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "pronunciationId")
	private PronunciationData pronunciationData;

	@ManyToOne
	@JoinColumn(name = "sessionId")
	private PronunciationSession pronunciationSession;

	@ManyToOne
	@JoinColumn(name = "userId")
	private User user;

	@Column(nullable = false)
	private Float accuracy;
}
