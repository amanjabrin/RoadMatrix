package com.roadmatrix.auth_service.service;

import com.roadmatrix.auth_service.dto.*;
import com.roadmatrix.auth_service.entity.User;
import com.roadmatrix.auth_service.exception.BadRequestException;
import com.roadmatrix.auth_service.exception.ResourceNotFoundException;
import com.roadmatrix.auth_service.repository.UserRepository;
import com.roadmatrix.auth_service.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole())
                .companyId(UUID.randomUUID()) // Assign a default company UUID
                .build();

        User savedUser = userRepository.save(user);

        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .role(savedUser.getRole())
                .companyId(savedUser.getCompanyId())
                .build();

        return RegisterResponse.builder()
                .success(true)
                .message("User registered successfully")
                .user(userDto)
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCompanyId());

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .companyId(user.getCompanyId())
                .build();

        return LoginResponse.builder()
                .success(true)
                .token(token)
                .user(userDto)
                .build();
    }

    public UserDto validateTokenAndGetUser(String token) {
        if (jwtUtil.isTokenExpired(token)) {
            throw new BadRequestException("Token has expired");
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .companyId(user.getCompanyId())
                .build();
    }
}
