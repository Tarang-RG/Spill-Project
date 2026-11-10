package com.spill.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExpenseResponse {

    private Long id;
    private String description;
    private BigDecimal totalAmount;
    private String paidBy;
    private String splitType;
    private LocalDateTime createdAt;
    private List<ExpenseSplitResponse> splits;
}