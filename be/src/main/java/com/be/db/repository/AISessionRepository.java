package com.be.db.repository;

import com.be.db.entity.AISession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AISessionRepository extends JpaRepository<AISession, Integer> {
}
