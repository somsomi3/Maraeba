package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "animal_correct")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(AnimalCorrectId.class) // 복합 키 사용
public class AnimalCorrect {

    @Id
    @Column(name = "game_id")
    private Integer gameId;

    @Id
    @Column(name = "animal_id")
    private Integer animalId;

    @Column(name = "location_x", nullable = false)
    private Integer locationX;

    @Column(name = "location_y", nullable = false)
    private Integer locationY;

    @ManyToOne
    @JoinColumn(name = "animal_id", insertable = false, updatable = false)
    private AnimalList animalList;  // 외래 키로 연결
}


