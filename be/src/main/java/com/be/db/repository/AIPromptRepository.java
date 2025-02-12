package com.be.db.repository;

import com.be.db.entity.AIChatPrompt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIPromptRepository extends JpaRepository<AIChatPrompt, Long> {
}
