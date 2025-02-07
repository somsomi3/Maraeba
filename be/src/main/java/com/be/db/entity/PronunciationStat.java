package com.be.db.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PronunciationStat extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "user_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;

	@ManyToOne
	@JoinColumn(name = "class_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private PronunciationClass pronunciationClass;

	@Column(nullable = false)
	private Float averageCorrectRate;

	@Column(nullable = false)
	private Integer count;

}
