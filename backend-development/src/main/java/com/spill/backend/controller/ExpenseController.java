
package com.spill.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.spill.backend.dto.CreateExpenseRequest;
import com.spill.backend.dto.ExpenseResponse;
import com.spill.backend.dto.GroupBalanceResponse;
import com.spill.backend.dto.SettlementResponse;
import com.spill.backend.service.ExpenseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        ExpenseResponse response = expenseService.createExpense(
                groupId,
                request,
                jwt.getSubject()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getGroupExpenses(
            @PathVariable Long groupId,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                expenseService.getGroupExpenses(
                        groupId,
                        jwt.getSubject()
                )
        );
    }
    @GetMapping("/balances")
    public ResponseEntity<GroupBalanceResponse> getGroupBalances(
            @PathVariable Long groupId,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                expenseService.getGroupBalances(
                        groupId,
                        jwt.getSubject()
                )
        );
    }
    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementResponse>> getSettlements(
            @PathVariable Long groupId,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                expenseService.getSettlements(
                        groupId,
                        jwt.getSubject()
                )
        );
    }
}
