package com.be.db.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class User extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String userId;

	private String password;

	@Column(nullable = false)
	private String email;

	@Column(nullable = false, length = 100)
	private String username;

	@Column(nullable = false, length = 50)
	private String provider;

	private String providerId;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private RefreshToken refreshToken;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private PasswordResetToken passwordResetToken;

	// 관계
	@OneToMany(mappedBy = "user")
	private List<PronunciationHistory> pronunciationHistories;

	@OneToMany(mappedBy = "user")
	private List<PronunciationStat> pronunciationStats;

	@OneToMany(mappedBy = "user")
	private List<WebRTCLog> webRTCLogs;

	@OneToMany(mappedBy = "user")
	private List<WebrtcMessage> websocketMessages;

	@OneToMany(mappedBy = "host")
	private List<Room> Rooms;

	@OneToMany(mappedBy = "user")
	private List<RoomUser> RoomUsers;

	@OneToMany(mappedBy = "user")
	private List<PronunciationSpecificStat> pronunciationSpecificStats;

	@OneToOne(mappedBy = "user")
	private UserTutorial userTutorials;
}
