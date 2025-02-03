package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "animal_game")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnimalGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String image;
}
