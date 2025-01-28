package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20)
    private String ingredientName;

    private String foodImage;






}
