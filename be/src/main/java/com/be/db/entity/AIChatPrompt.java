package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_prompt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIChatPrompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ai_position", nullable = false)
    private String aiPositon;

    @Column(name= "user_position", nullable = false)
    private String userPostion;

    @Column(nullable = false)
    private String situation;
}
