package com.spill.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String inviteCode;
    private String role;
    private LocalDateTime createdAt;
}