package com.be.db.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import java.util.List;

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

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private RefreshToken refreshToken;

	// 관계
	@OneToMany(mappedBy = "user")
	private List<PronunciationHistory> pronunciationHistories;
}
