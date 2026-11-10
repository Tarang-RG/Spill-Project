package com.spill.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinGroupRequest {

    @NotBlank(message = "Invite code is required")
    @Size(max = 12)
    private String inviteCode;
}