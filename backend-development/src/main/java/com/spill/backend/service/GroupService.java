package com.spill.backend.service;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spill.backend.dto.CreateGroupRequest;
import com.spill.backend.dto.GroupDetailsResponse;
import com.spill.backend.dto.GroupMemberResponse;
import com.spill.backend.dto.GroupResponse;
import com.spill.backend.dto.JoinGroupRequest;
import com.spill.backend.model.Group;
import com.spill.backend.model.GroupMember;
import com.spill.backend.model.User;
import com.spill.backend.repository.GroupMemberRepository;
import com.spill.backend.repository.GroupRepository;
import com.spill.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    private static final String CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, String email) {

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Group group = new Group();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription());
        group.setCreatedBy(creator);
        group.setInviteCode(generateInviteCode());

        Group savedGroup = groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUser(creator);
        member.setRole("ADMIN");

        groupMemberRepository.save(member);

        return new GroupResponse(
                savedGroup.getId(),
                savedGroup.getName(),
                savedGroup.getDescription(),
                savedGroup.getInviteCode(),
                member.getRole(),
                savedGroup.getCreatedAt()
        );
    }

    private String generateInviteCode() {

        String inviteCode;

        do {
            StringBuilder code = new StringBuilder();

            for (int i = 0; i < 8; i++) {
                int index = RANDOM.nextInt(CHARACTERS.length());
                code.append(CHARACTERS.charAt(index));
            }

            inviteCode = code.toString();

        } while (groupRepository.existsByInviteCode(inviteCode));

        return inviteCode;
    }
    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<GroupMember> memberships =
                groupMemberRepository.findByUserId(user.getId());

        return memberships.stream()
                .map(member -> {
                    Group group = member.getGroup();

                    return new GroupResponse(
                            group.getId(),
                            group.getName(),
                            group.getDescription(),
                            group.getInviteCode(),
                            member.getRole(),
                            group.getCreatedAt()
                    );
                })
                .toList();
    }
    @Transactional
    public GroupResponse joinGroup(JoinGroupRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String inviteCode = request.getInviteCode().trim().toUpperCase();

        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        boolean alreadyMember = groupMemberRepository
                .existsByGroupIdAndUserId(group.getId(), user.getId());

        if (alreadyMember) {
            throw new IllegalArgumentException("You are already a member of this group");
        }

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setRole("MEMBER");

        groupMemberRepository.save(member);

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getInviteCode(),
                member.getRole(),
                group.getCreatedAt()
        );
    }
    @Transactional(readOnly = true)
    public GroupDetailsResponse getGroupDetails(Long groupId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        boolean isMember = groupMemberRepository
                .existsByGroupIdAndUserId(groupId, user.getId());

        if (!isMember) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You are not a member of this group"
            );
        }

        List<GroupMemberResponse> members = groupMemberRepository
                .findByGroupId(groupId)
                .stream()
                .map(member -> new GroupMemberResponse(
                        member.getUser().getId(),
                        member.getUser().getFullName(),
                        member.getUser().getEmail(),
                        member.getRole()
                ))
                .toList();

        return new GroupDetailsResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getInviteCode(),
                group.getCreatedAt(),
                members
        );
    }
}