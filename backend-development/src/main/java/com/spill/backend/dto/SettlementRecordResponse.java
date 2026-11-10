package com.spill.backend.dto;

import com.spill.backend.model.SettlementStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SettlementRecordResponse(
	    Long id,
	    Long fromUserId,
	    String fromUser,
	    Long toUserId,
	    String toUser,
	    BigDecimal amount,
	    SettlementStatus status,
	    LocalDateTime createdAt,
	    LocalDateTime confirmedAt
	) {}