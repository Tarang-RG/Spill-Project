package com.spill.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupMemberResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String role;
}