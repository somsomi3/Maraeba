package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColorItem extends BaseEntity {

    // 색상 (빨, 주, 노, 초, 파, 남, 보)
    @Column(nullable = false, length = 10)
    private String color;

    // 물건 이름
    @Column(nullable = false, length = 100)
    private String name;
}