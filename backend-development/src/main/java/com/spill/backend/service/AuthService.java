
package com.spill.backend.service;

import com.spill.backend.dto.LoginRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.spill.backend.dto.AuthResponse;
import com.spill.backend.dto.RegisterRequest;
import com.spill.backend.model.User;
import com.spill.backend.repository.UserRepository;
import com.spill.backend.dto.LoginResponse;
import com.spill.backend.service.JwtService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        // Never store plain-text passwords
        user.setPasswordHash(
            passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);

        return new AuthResponse(
            "Registration successful",
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFullName()
        );
    }
    
    public LoginResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"
            ));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
            "Login successful",
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            token,
            "Bearer",
            86400
        );
    }
    public AuthResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"
            ));

        return new AuthResponse(
            "User fetched successfully",
            user.getId(),
            user.getEmail(),
            user.getFullName()
        );
    }
}
