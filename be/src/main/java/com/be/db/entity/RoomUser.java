package com.be.db.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room", "user"})
    }
)
@Getter
@Setter
public class RoomUser extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER) // EAGER로 변경
    @JoinColumn(name = "user", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    // session_id 외래키 매핑
    @ManyToOne
    @JoinColumn(name = "room", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Room room;

    private Boolean isHost;  // 방장 여부

    private Boolean isExist = false; // 방 나갔는지 여부

}
