package com.be.db.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AccessTokenBlacklist extends BaseEntity {
	private String token;
	private LocalDateTime expiryDate;
}
