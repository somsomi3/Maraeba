package com.be.db.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter

public class User extends BaseEntity {
	String userId;
	String password;
	String email;
	String username;
	LocalDateTime createDate;
	LocalDateTime modifyDate;
	String snsType;
	String snsId;
	String snsConnectDate;
}
