
package com.spill.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spill.backend.model.ExpenseSplit;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    List<ExpenseSplit> findByExpenseId(Long expenseId);
}
