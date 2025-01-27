package com.be.db.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id = null;

	@CreatedDate
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	// JPA 자체 기능을 사용하여 구현한 부분. Spring 외부에서도 사용 가능
	// @PrePersist
	// protected void onCreate() {
	// 	this.createdAt = LocalDateTime.now();
	// 	this.updatedAt = LocalDateTime.now();
	// }
	//
	// @PreUpdate
	// protected void onUpdate() {
	// 	this.updatedAt = LocalDateTime.now();
	// }
}
