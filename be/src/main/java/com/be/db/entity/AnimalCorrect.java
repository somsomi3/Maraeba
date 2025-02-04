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

    // AnimalList와 연결 (animal_id 외래 키)
    @ManyToOne
    @JoinColumn(name = "animal_id", insertable = false, updatable = false)
    private AnimalList animalList;

    // AnimalGame과 연결 (game_id 외래 키)
    @ManyToOne
    @JoinColumn(name = "game_id", insertable = false, updatable = false)
    private AnimalGame animalGame;
}
