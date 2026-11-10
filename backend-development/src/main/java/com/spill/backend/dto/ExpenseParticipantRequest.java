package com.spill.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExpenseParticipantRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @DecimalMin(value = "0.01", message = "Share must be greater than zero")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal shareAmount;
}