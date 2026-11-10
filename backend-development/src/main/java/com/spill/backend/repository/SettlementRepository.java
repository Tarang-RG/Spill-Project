
package com.spill.backend.repository;

import com.spill.backend.model.Settlement;
import com.spill.backend.model.SettlementStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SettlementRepository
        extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    List<Settlement> findByGroupIdAndStatus(
            Long groupId,
            SettlementStatus status
    );
    Optional<Settlement> findByIdAndGroupId(Long id, Long groupId);
    
    boolean existsByGroupIdAndStatus(Long groupId, SettlementStatus status );

}
