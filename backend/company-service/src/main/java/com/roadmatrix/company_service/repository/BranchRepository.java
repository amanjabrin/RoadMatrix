package com.roadmatrix.company_service.repository;

import com.roadmatrix.company_service.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findByCompanyId(UUID companyId);
}
