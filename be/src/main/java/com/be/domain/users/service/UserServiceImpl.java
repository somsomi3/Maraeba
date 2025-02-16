package com.be.domain.users.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.User;
import com.be.db.entity.UserTutorial;
import com.be.db.repository.UserRepository;
import com.be.db.repository.UserTutorialRepository;
import com.be.domain.users.dto.UserTutorialDTO;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import com.be.domain.users.response.GetCurrentUserResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final UserTutorialRepository userTutorialRepository;

	private User findUserById(long id) {
		log.info("id : {}", id);
		return userRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	}

	@Override
	public GetCurrentUserResponse getCurrentUser(Long id) {
		return GetCurrentUserResponse.from(findUserById(id));
	}

	@Transactional
	@Override
	public void updateUser(Long id, UserUpdateRequest request) {
		User user = findUserById(id);
		String newEmail = request.getEmail();
		String newUsername = request.getUsername();
		if (newEmail != null && !newEmail.isBlank()) {
			user.setEmail(newEmail);
		}
		if (newUsername != null && !newUsername.isBlank()) {
			user.setUsername(request.getUsername());
		}
	}

	@Transactional
	@Override
	public void updatePassword(Long id, PasswordUpdateRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
		}
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	@Transactional
	public void deleteUser(Long id, PasswordRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
		}
		userRepository.delete(user);
		userRepository.flush();
	}

	@Override
	public UserTutorialDTO getTutorial(Long id) {
		UserTutorial userTutorial = userTutorialRepository.findByUser_Id(id)
			.orElseGet(() -> {
				// 새로운 UserTutorial 생성 및 저장
				User newUser = userRepository.findById(id)
					.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

				UserTutorial newUserTutorial = UserTutorial.builder()
					.user(newUser)
					.hasSeenPron(false)
					.hasSeenFood(false)
					.hasSeenAnimal(false)
					.hasSeenAI(false)
					.build();

				return userTutorialRepository.save(newUserTutorial);
			});

		UserTutorialDTO response = UserTutorialDTO.builder().hasSeenPron(userTutorial.getHasSeenPron())
			.hasSeenFood(userTutorial.getHasSeenFood())
			.hasSeenAnimal(userTutorial.getHasSeenAnimal())
			.hasSeenAI(userTutorial.getHasSeenAI())
			.build();
		return response;
	}

	@Override
	public void updateTutorial(Long id, Integer tutorialId) {
		UserTutorial userTutorial = userTutorialRepository.findByUser_Id(id)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		switch (tutorialId) {
			case 1:
				userTutorial.setHasSeenPron(true);
				break;
			case 2:
				userTutorial.setHasSeenFood(true);
				break;
			case 3:
				userTutorial.setHasSeenAnimal(true);
				break;
			case 4:
				userTutorial.setHasSeenAI(true);
				break;
			default:
				break;
		}
		userTutorialRepository.save(userTutorial);
	}
}
