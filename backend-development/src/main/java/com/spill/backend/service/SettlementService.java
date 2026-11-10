
package com.spill.backend.service;

import com.spill.backend.dto.CreateSettlementRequest;
import com.spill.backend.dto.GroupBalanceResponse;
import com.spill.backend.dto.MemberBalanceResponse;
import com.spill.backend.dto.SettlementRecordResponse;
import com.spill.backend.model.*;
import com.spill.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;

    public SettlementService(
            SettlementRepository settlementRepository,
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository,
            ExpenseService expenseService) {

        this.settlementRepository = settlementRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.expenseService = expenseService;
    }

    @Transactional
    public SettlementRecordResponse createSettlement(
            Long groupId,
            CreateSettlementRequest request,
            String email) {

        User fromUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, fromUser.getId())) {
            throw new RuntimeException("You are not a member of this group");
        }

        User toUser = userRepository.findById(request.getToUserId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, toUser.getId())) {
            throw new RuntimeException("Receiver is not a member of this group");
        }

        if (fromUser.getId().equals(toUser.getId())) {
            throw new RuntimeException("You cannot settle with yourself");
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Settlement amount must be positive");
        }

        if (amount.scale() > 2) {
            throw new RuntimeException(
                    "Settlement amount can have at most 2 decimal places");
        }

        // Get current group balances
        GroupBalanceResponse balances =
                expenseService.getGroupBalances(groupId, email);


		BigDecimal fromBalance = balances.getMembers()
		        .stream()
		        .filter(b -> b.getUserId().equals(fromUser.getId()))
		        .map(MemberBalanceResponse::getNetBalance)
		        .findFirst()
		        .orElse(BigDecimal.ZERO);
		
		BigDecimal toBalance = balances.getMembers()
		        .stream()
		        .filter(b -> b.getUserId().equals(toUser.getId()))
		        .map(MemberBalanceResponse::getNetBalance)
		        .findFirst()
		        .orElse(BigDecimal.ZERO);


        if (fromBalance.compareTo(BigDecimal.ZERO) >= 0
                || toBalance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "Payment must be made from a member who owes money to a member who should receive money");
        }

        BigDecimal outstanding = fromBalance.abs();

        List<Settlement> pending =
                settlementRepository.findByGroupIdAndStatus(
                        groupId, SettlementStatus.PENDING);

        BigDecimal alreadyPending = pending.stream()
                .filter(s ->
                        s.getFromUser().getId().equals(fromUser.getId())
                        && s.getToUser().getId().equals(toUser.getId()))
                .map(Settlement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        outstanding = outstanding.subtract(alreadyPending);

        if (amount.compareTo(outstanding) > 0) {
            throw new RuntimeException(
                    "Amount exceeds the outstanding amount of ₹" + outstanding);
        }

        Settlement settlement = new Settlement();

        settlement.setGroup(group);
        settlement.setFromUser(fromUser);
        settlement.setToUser(toUser);
        settlement.setAmount(amount);
        settlement.setStatus(SettlementStatus.PENDING);

        Settlement saved = settlementRepository.save(settlement);

        return toResponse(saved);
    }

    @Transactional
    public SettlementRecordResponse confirmSettlement(
            Long groupId,
            Long settlementId,
            String email) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Settlement settlement = settlementRepository
                .findByIdAndGroupId(settlementId, groupId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (!settlement.getToUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "Only the receiver can confirm this settlement");
        }

        if (settlement.getStatus() != SettlementStatus.PENDING) {
            throw new RuntimeException("This settlement is no longer pending");
        }

        settlement.setStatus(SettlementStatus.CONFIRMED);
        settlement.setConfirmedAt(LocalDateTime.now());

        return toResponse(settlementRepository.save(settlement));
    }

    @Transactional
    public SettlementRecordResponse rejectSettlement(
            Long groupId,
            Long settlementId,
            String email) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Settlement settlement = settlementRepository
                .findByIdAndGroupId(settlementId, groupId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (!settlement.getToUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "Only the receiver can reject this settlement");
        }

        if (settlement.getStatus() != SettlementStatus.PENDING) {
            throw new RuntimeException("This settlement is no longer pending");
        }

        settlement.setStatus(SettlementStatus.REJECTED);

        return toResponse(settlementRepository.save(settlement));
    }

    private SettlementRecordResponse toResponse(Settlement settlement) {

        return new SettlementRecordResponse(
                settlement.getId(),
                settlement.getFromUser().getId(),
                settlement.getFromUser().getFullName(),
                settlement.getToUser().getId(),
                settlement.getToUser().getFullName(),
                settlement.getAmount(),
                settlement.getStatus(),
                settlement.getCreatedAt(),
                settlement.getConfirmedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<SettlementRecordResponse> getSettlementHistory(
            Long groupId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, user.getId())) {
            throw new RuntimeException("You are not a member of this group");
        }

        return settlementRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
