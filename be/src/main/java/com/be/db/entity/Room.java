package com.be.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room extends BaseEntity {
    //BaseEntity에서 상속받은 그냥Id(고유번호), 생성시간, 수정시간)

    @Column(nullable = false, length = 20)
    private String title;

    private LocalDateTime StartedAt;

    private boolean isActive = true;

    private String roomPassword;

    // owner_id를 User의 기본키와 연결
    @ManyToOne(fetch = FetchType.EAGER) // EAGER로 변경
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User host;

    // 세션에 저장된 메시지들 (OneToMany)
    @OneToMany(mappedBy = "room")
    @JsonIgnore // 직렬화에서 메시지 목록을 제외하여 Lazy Loading 문제 방지
    private List<WebrtcMessage> messages = new ArrayList<>();


    @OneToMany(mappedBy = "room")
    @JsonIgnore // 직렬화에서 메시지 목록을 제외하여 Lazy Loading 문제 방지
    private List<RoomUser> roomUsers = new ArrayList<>();
}
