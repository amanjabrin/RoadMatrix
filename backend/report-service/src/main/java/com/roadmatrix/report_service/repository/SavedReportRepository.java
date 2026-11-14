package com.roadmatrix.report_service.repository;

import com.roadmatrix.report_service.entity.SavedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, UUID> {
    List<SavedReport> findByCompanyId(UUID companyId);
    List<SavedReport> findByCompanyIdOrderByGeneratedAtDesc(UUID companyId);
    List<SavedReport> findAllByOrderByGeneratedAtDesc();
    List<SavedReport> findByType(String type);
    List<SavedReport> findByCompanyIdAndType(UUID companyId, String type);
}
