package com.be.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserTutorialDTO {

	private boolean hasSeenPron = false;
	private boolean hasSeenFood = false;
	private boolean hasSeenAnimal = false;
	private boolean hasSeenAI = false;
}
