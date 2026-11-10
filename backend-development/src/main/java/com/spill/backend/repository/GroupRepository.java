package com.spill.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spill.backend.model.Group;

public interface GroupRepository extends JpaRepository<Group, Long> {

    boolean existsByInviteCode(String inviteCode);
    Optional<Group> findByInviteCode(String inviteCode);
}