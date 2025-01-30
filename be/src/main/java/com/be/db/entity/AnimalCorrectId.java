package com.be.db.entity;

import lombok.Data;

import java.io.Serializable;

// 복합 키 클래스 (Serializable 필수)
@Data
public class AnimalCorrectId implements Serializable {
    private Integer gameId;
    private Integer animalId;
}
