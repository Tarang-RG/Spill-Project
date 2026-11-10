package com.spill.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.spill.backend.dto.CreateGroupRequest;
import com.spill.backend.dto.GroupDetailsResponse;
import com.spill.backend.dto.GroupResponse;
import com.spill.backend.dto.JoinGroupRequest;
import com.spill.backend.service.GroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        GroupResponse response = groupService.createGroup(
                request,
                jwt.getSubject()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupResponse>> getMyGroups(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                groupService.getMyGroups(jwt.getSubject())
        );
    }
    @PostMapping("/join")
    public ResponseEntity<GroupResponse> joinGroup(
            @Valid @RequestBody JoinGroupRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        GroupResponse response = groupService.joinGroup(
                request,
                jwt.getSubject()
        );

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDetailsResponse> getGroupDetails(
            @PathVariable Long groupId,
            @AuthenticationPrincipal Jwt jwt) {

        GroupDetailsResponse response = groupService.getGroupDetails(
                groupId,
                jwt.getSubject()
        );

        return ResponseEntity.ok(response);
    }
}