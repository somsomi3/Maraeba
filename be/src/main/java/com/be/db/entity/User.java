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
public class User extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String userId;

	private String password;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false, length = 100)
	private String username;

	@Column(nullable = false, length = 50)
	private String provider;

	private String providerId;

	// 관계
	@OneToMany(mappedBy = "user")
	private List<PronunciationSession> pronunciationSessions;

	@OneToMany(mappedBy = "user")
	private List<PronunciationRecord> pronunciationRecords;

	@OneToMany(mappedBy = "user")
	private List<PronunciationCompletedClass> pronunciationCompletedClasses;
}
