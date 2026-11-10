package com.spill.backend.dto;

import java.math.BigDecimal;

public record SettlementResponse(
		Long fromUserId,
        String fromUser,
        Long toUserId,
        String toUser,
        BigDecimal amount
) {}