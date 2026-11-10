package com.spill.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.spill.backend.dto.*;
import com.spill.backend.model.*;
import com.spill.backend.repository.*;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SettlementRepository settlementRepository;

    @Transactional
    public ExpenseResponse createExpense(
            Long groupId,
            CreateExpenseRequest request,
            String email) {

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Group not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, creator.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this group");
        }

        User payer = userRepository.findById(request.getPaidByUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payer not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, payer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payer is not a member of this group");
        }

        List<ExpenseParticipantRequest> participants =
                request.getParticipants();

        Set<Long> participantIds = new HashSet<>();

        for (ExpenseParticipantRequest participant : participants) {
            if (!participantIds.add(participant.getUserId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate participants are not allowed");
            }

            if (!groupMemberRepository.existsByGroupIdAndUserId(
                    groupId, participant.getUserId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A selected participant is not a group member");
            }
        }

        List<BigDecimal> shares = calculateShares(
                request, participants.size());
        
        Expense expense = new Expense();

        expense.setGroup(group);
        expense.setDescription(request.getDescription().trim());
        expense.setTotalAmount(request.getTotalAmount());
        expense.setPaidBy(payer);
        expense.setCreatedBy(creator);
        expense.setSplitType(request.getSplitType());

        Expense savedExpense = expenseRepository.save(expense);

        List<ExpenseSplit> savedSplits = new ArrayList<>();

        for (int i = 0; i < participants.size(); i++) {
            User participant = userRepository.findById(
                    participants.get(i).getUserId()
            ).orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Participant not found"));

            ExpenseSplit split = new ExpenseSplit();

            split.setExpense(savedExpense);
            split.setUser(participant);
            split.setShareAmount(shares.get(i));

            savedSplits.add(expenseSplitRepository.save(split));
        }

        // Prepare split responses
        List<ExpenseSplitResponse> splitResponses =
                savedSplits.stream()
                        .map(split -> new ExpenseSplitResponse(
                                split.getUser().getId(),
                                split.getUser().getFullName(),
                                split.getShareAmount()
                        ))
                        .toList();

        return new ExpenseResponse(
                savedExpense.getId(),
                savedExpense.getDescription(),
                savedExpense.getTotalAmount(),
                payer.getFullName(),
                savedExpense.getSplitType(),
                savedExpense.getCreatedAt(),
                splitResponses
        );
    }

    private List<BigDecimal> calculateShares(
            CreateExpenseRequest request,
            int participantCount) {

        BigDecimal total = request.getTotalAmount();

        if (participantCount <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one participant is required");
        }

        List<BigDecimal> shares = new ArrayList<>();

        if ("EQUAL".equals(request.getSplitType())) {
            long totalPaise = total
                    .movePointRight(2)
                    .longValueExact();

            long basePaise = totalPaise / participantCount;
            long remainder = totalPaise % participantCount;

            for (int i = 0; i < participantCount; i++) {
                long sharePaise = basePaise;
                if (i < remainder) {
                    sharePaise++;
                }
                shares.add(BigDecimal.valueOf(sharePaise, 2));
            }

            return shares;
        }

        BigDecimal splitTotal = BigDecimal.ZERO;
        for (ExpenseParticipantRequest participant :
                request.getParticipants()) {

            BigDecimal amount = participant.getShareAmount();

            if (amount == null
                    || amount.compareTo(BigDecimal.ZERO) <= 0
                    || amount.scale() > 2) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Every custom share must be positive and have at most two decimal places");
            }
            shares.add(amount);
            splitTotal = splitTotal.add(amount);
        }

        if (splitTotal.compareTo(total) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                   "Individual shares must add up to the total amount");
        }

        return shares;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getGroupExpenses(
            Long groupId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
        if (!groupRepository.existsById(groupId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Group not found");

        }

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not a member of this group");
        }

        List<Expense> expenses =
                expenseRepository
                        .findByGroupIdOrderByCreatedAtDesc(
                                groupId);

        return expenses.stream()
                .map(expense -> {

                    List<ExpenseSplitResponse> splits =
                            expenseSplitRepository
                                    .findByExpenseId(expense.getId())
                                    .stream()
                                    .map(split -> new ExpenseSplitResponse(
                                            split.getUser().getId(),
                                            split.getUser().getFullName(),
                                            split.getShareAmount()
                                    ))
                                    .toList();

                    return new ExpenseResponse(
                            expense.getId(),
                            expense.getDescription(),
                            expense.getTotalAmount(),
                            expense.getPaidBy().getFullName(),
                            expense.getSplitType(),
                            expense.getCreatedAt(),
                            splits
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupBalanceResponse getGroupBalances(
            Long groupId, String email) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (!groupRepository.existsById(groupId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Group not found");
        }

        if (!groupMemberRepository.existsByGroupIdAndUserId(
                groupId, currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Not a group member");
        }

        List<GroupMember> memberships =
                groupMemberRepository.findByGroupId(groupId);

        List<Expense> expenses =
                expenseRepository
                        .findByGroupIdOrderByCreatedAtDesc(
                                groupId);

        Map<Long, BigDecimal> paidMap = new HashMap<>();
        Map<Long, BigDecimal> shareMap = new HashMap<>();
        Map<Long, BigDecimal> settlementPaidMap = new HashMap<>();
        Map<Long, BigDecimal> settlementReceivedMap = new HashMap<>();

        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (GroupMember membership : memberships) {

            Long userId = membership.getUser().getId();

            paidMap.put(userId, BigDecimal.ZERO);
            shareMap.put(userId, BigDecimal.ZERO);
            settlementPaidMap.put(userId, BigDecimal.ZERO);
            settlementReceivedMap.put(userId, BigDecimal.ZERO);
        }

        // Calculate payments and shares from active expenses
        for (Expense expense : expenses) {
            Long payerId = expense.getPaidBy().getId();

            paidMap.merge(
                    payerId,
                    expense.getTotalAmount(),
                    BigDecimal::add
            );

            totalExpenses = totalExpenses.add(expense.getTotalAmount());

            List<ExpenseSplit> splits =
                    expenseSplitRepository.findByExpenseId(expense.getId());

            for (ExpenseSplit split : splits) {
                Long userId = split.getUser().getId();

                shareMap.merge(
                        userId,
                        split.getShareAmount(),
                        BigDecimal::add
                );
            }
        }

        // Calculate confirmed settlements
        List<Settlement> confirmedSettlements =
                settlementRepository.findByGroupIdAndStatus(
                        groupId, SettlementStatus.CONFIRMED);

        for (Settlement settlement : confirmedSettlements) {
            Long payerId = settlement.getFromUser().getId();
            Long receiverId = settlement.getToUser().getId();

            settlementPaidMap.merge(
                    payerId,
                    settlement.getAmount(),
                    BigDecimal::add
            );

            settlementReceivedMap.merge(
                    receiverId,
                    settlement.getAmount(),
                    BigDecimal::add
            );
        }

        List<MemberBalanceResponse> memberBalances =
                memberships.stream()
                        .map(membership -> {
                            User member = membership.getUser();
                            Long userId = member.getId();
                            BigDecimal paid = paidMap.get(userId);
                            BigDecimal share = shareMap.get(userId);
                            BigDecimal net = paid
                                    .subtract(share)
                                    .add(settlementPaidMap.get(userId))
                                    .subtract(settlementReceivedMap.get(userId))
                                    .setScale(2, RoundingMode.HALF_UP);

                            return new MemberBalanceResponse(
                                    userId,
                                    member.getFullName(),
                                    paid,
                                    share,
                                    net
                            );
                        })
                        .toList();

        return new GroupBalanceResponse(
                groupId,
                totalExpenses,
                memberBalances
        );
    }


@Transactional(readOnly = true)
public List<SettlementResponse> getSettlements(
        Long groupId, String email) {

    // Get final balances after all confirmed payments.
    GroupBalanceResponse balanceResponse =
            getGroupBalances(groupId, email);

    List<MemberBalanceResponse> members =
            balanceResponse.getMembers();

    // Store each member's current net balance.
    Map<Long, BigDecimal> remainingBalances = new HashMap<>();

    for (MemberBalanceResponse member : members) {
        remainingBalances.put(
                member.getUserId(),
                member.getNetBalance().setScale(2, RoundingMode.HALF_UP)
        );
    }

    // Pending payments should reduce the suggestions,
    // but must NOT change actual balances until confirmed.
    List<Settlement> pendingSettlements =
            settlementRepository.findByGroupIdAndStatus(
                    groupId, SettlementStatus.PENDING);

    for (Settlement settlement : pendingSettlements) {

        Long fromId = settlement.getFromUser().getId();
        Long toId = settlement.getToUser().getId();

        remainingBalances.merge(
                fromId,
                settlement.getAmount(),
                BigDecimal::add
        );

        remainingBalances.merge(
                toId,
                settlement.getAmount().negate(),
                BigDecimal::add
        );
    }

    // Separate members into debtors and creditors.
    List<MemberBalanceResponse> debtors = new ArrayList<>();
    List<MemberBalanceResponse> creditors = new ArrayList<>();

    for (MemberBalanceResponse member : members) {

        BigDecimal balance =
                remainingBalances.get(member.getUserId());

        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            debtors.add(member);
        } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
            creditors.add(member);
        }
    }

    // Match debtors with creditors to minimize transactions.
    List<SettlementResponse> suggestions = new ArrayList<>();

    int debtorIndex = 0;
    int creditorIndex = 0;

    while (debtorIndex < debtors.size()
            && creditorIndex < creditors.size()) {

        MemberBalanceResponse debtor = debtors.get(debtorIndex);
        MemberBalanceResponse creditor = creditors.get(creditorIndex);

        BigDecimal debt = remainingBalances
                .get(debtor.getUserId()).abs();

        BigDecimal credit = remainingBalances
                .get(creditor.getUserId());

        BigDecimal payment = debt.min(credit)
                .setScale(2, RoundingMode.HALF_UP);

        if (payment.compareTo(BigDecimal.ZERO) <= 0) {
            break;
        }

        suggestions.add(new SettlementResponse(
                debtor.getUserId(),
                debtor.getFullName(),
                creditor.getUserId(),
                creditor.getFullName(),
                payment
        ));

        // Update remaining balances locally.
        remainingBalances.put(
                debtor.getUserId(),
                remainingBalances.get(debtor.getUserId()).add(payment)
        );

        remainingBalances.put(
                creditor.getUserId(),
                remainingBalances.get(creditor.getUserId()).subtract(payment)
        );

        if (remainingBalances.get(debtor.getUserId())
                .abs().compareTo(new BigDecimal("0.01")) < 0) {
            debtorIndex++;
        }

        if (remainingBalances.get(creditor.getUserId())
                .abs().compareTo(new BigDecimal("0.01")) < 0) {
            creditorIndex++;
        }
    }

    return suggestions;
}


}
