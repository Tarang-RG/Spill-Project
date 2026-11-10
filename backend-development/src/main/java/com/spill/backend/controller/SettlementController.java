
package com.spill.backend.controller;

import com.spill.backend.dto.CreateSettlementRequest;
import com.spill.backend.dto.SettlementRecordResponse;
import com.spill.backend.service.SettlementService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups/{groupId}/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @PostMapping
    public ResponseEntity<SettlementRecordResponse> createSettlement(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateSettlementRequest request,
            Authentication authentication) {

        SettlementRecordResponse response =
                settlementService.createSettlement(
                        groupId, request, authentication.getName()
                );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{settlementId}/confirm")
    public ResponseEntity<SettlementRecordResponse> confirmSettlement(
            @PathVariable Long groupId,
            @PathVariable Long settlementId,
            Authentication authentication) {

        return ResponseEntity.ok(
                settlementService.confirmSettlement(
                        groupId, settlementId, authentication.getName()
                )
        );
    }

    @PatchMapping("/{settlementId}/reject")
    public ResponseEntity<SettlementRecordResponse> rejectSettlement(
            @PathVariable Long groupId,
            @PathVariable Long settlementId,
            Authentication authentication) {

        return ResponseEntity.ok(
                settlementService.rejectSettlement(
                        groupId, settlementId, authentication.getName()
                )
        );
    }
    @GetMapping("/history")
    public ResponseEntity<List<SettlementRecordResponse>> getSettlementHistory(
            @PathVariable Long groupId,
            Authentication authentication) {

        return ResponseEntity.ok(
                settlementService.getSettlementHistory(
                        groupId, authentication.getName()
                )
        );
    }
}
