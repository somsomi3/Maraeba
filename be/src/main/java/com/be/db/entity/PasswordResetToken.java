package com.be.db.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
public class PasswordResetToken extends BaseEntity {
    @Column(nullable = false, unique = true) // 토큰은 유일해야 함
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "userId")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false) // 만료일은 반드시 존재해야 함
    private LocalDateTime expiryDate;

    public PasswordResetToken(User user) {
        this.token = UUID.randomUUID().toString();
        this.user = user;
        this.expiryDate = LocalDateTime.now().plusHours(1); // 1시간 후 만료
    }

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDateTime.now());
    }
}