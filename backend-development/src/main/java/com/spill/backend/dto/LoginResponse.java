package com.spill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String message;
    private Long userId;
    private String email;
    private String fullName;
    private String token;
    private String tokenType;
    private long expiresIn;
}