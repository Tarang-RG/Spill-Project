package com.spill.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupDetailsResponse {

    private Long id;
    private String name;
    private String description;
    private String inviteCode;
    private LocalDateTime createdAt;
    private List<GroupMemberResponse> members;
}