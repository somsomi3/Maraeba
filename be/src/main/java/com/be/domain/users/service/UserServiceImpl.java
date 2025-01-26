package com.be.domain.users.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.UserNotFoundException;
import com.be.db.entity.User;
import com.be.db.repository.UserRepository;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public User getCurrentUser(Long id) {
		return userRepository.findById(id)
			.orElseThrow(UserNotFoundException::new);
	}

	@Override
	public void updateUser(Long id, UserUpdateRequest request) {
		User user = userRepository.findById(id)
			.orElseThrow(UserNotFoundException::new);

		user.setEmail(request.getEmail());
		user.setUsername(request.getUsername());
		userRepository.save(user);
	}

	@Override
	public void updatePassword(Long id, PasswordUpdateRequest request) {
		User user = userRepository.findById(id)
			.orElseThrow(UserNotFoundException::new);

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new PasswordMismatchException();
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	public void deleteUser(Long id, PasswordRequest request) {
		User user = userRepository.findById(id)
			.orElseThrow(UserNotFoundException::new);

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new PasswordMismatchException();
		}
		userRepository.delete(user);
	}
}
