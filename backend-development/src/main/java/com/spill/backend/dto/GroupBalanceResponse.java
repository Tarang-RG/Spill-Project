package com.spill.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupBalanceResponse {

    private Long groupId;
    private BigDecimal totalExpenses;
    private List<MemberBalanceResponse> members;
}