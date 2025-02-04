package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_game")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20)
    private String resultName;

    @Column(nullable = false, length = 255)
    private String resultImage;

    @OneToOne
    @JoinColumn(name = "food1_id", nullable = false)
    private FoodItem foodItem1;

    @OneToOne
    @JoinColumn(name = "food2_id", nullable = false)
    private FoodItem foodItem2;
}
