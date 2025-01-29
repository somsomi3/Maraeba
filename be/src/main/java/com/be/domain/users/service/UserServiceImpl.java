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
import com.be.domain.users.response.GetCurrentUserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	private User findUserById(long id) {
		return userRepository.findById(id).orElseThrow(UserNotFoundException::new);
	}

	@Override
	public GetCurrentUserResponse getCurrentUser(Long id) {
		return GetCurrentUserResponse.from(findUserById(id));
	}

	@Override
	public void updateUser(Long id, UserUpdateRequest request) {
		User user = findUserById(id);
		user.setEmail(request.getEmail());
		user.setUsername(request.getUsername());
		userRepository.save(user);
	}

	@Override
	public void updatePassword(Long id, PasswordUpdateRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new PasswordMismatchException();
		}
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	public void deleteUser(Long id, PasswordRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new PasswordMismatchException();
		}
		userRepository.delete(user);
	}
}
