package com.spill.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExpenseSplitResponse {

    private Long userId;
    private String fullName;
    private BigDecimal shareAmount;
}