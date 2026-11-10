package com.spill.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateExpenseRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 150)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Payer is required")
    private Long paidByUserId;

    @NotBlank(message = "Split type is required")
    @Pattern(regexp = "EQUAL|CUSTOM", message = "Split type must be EQUAL or CUSTOM")
    private String splitType;

    @NotEmpty(message = "Select at least one participant")
    @Valid
    private List<ExpenseParticipantRequest> participants;
}