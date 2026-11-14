package com.roadmatrix.report_service.service;

import com.roadmatrix.report_service.dto.SavedReportDto;
import com.roadmatrix.report_service.entity.SavedReport;
import com.roadmatrix.report_service.exception.BadRequestException;
import com.roadmatrix.report_service.exception.ResourceNotFoundException;
import com.roadmatrix.report_service.repository.SavedReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final SavedReportRepository savedReportRepository;
    private final RestTemplate restTemplate;

    public static final Set<String> VALID_REPORT_TYPES = Set.of("fleet", "driver", "fuel", "trip", "maintenance", "summary");
    private static final UUID DEFAULT_COMPANY_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    public List<SavedReportDto> getSavedReports(UUID companyId, String type) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<SavedReport> reports;
        if (type != null && !type.trim().isEmpty()) {
            reports = savedReportRepository.findByCompanyIdAndType(effectiveCompanyId, type.trim().toLowerCase());
        } else {
            reports = savedReportRepository.findByCompanyIdOrderByGeneratedAtDesc(effectiveCompanyId);
        }

        return reports.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SavedReportDto getSavedReportById(UUID id) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report with ID '" + id + "' not found"));
        return mapToDto(report);
    }

    public SavedReportDto saveReport(SavedReportDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Report name cannot be empty");
        }
        if (dto.getType() == null || !VALID_REPORT_TYPES.contains(dto.getType().toLowerCase().trim())) {
            throw new BadRequestException("Invalid report type. Allowed values: " + VALID_REPORT_TYPES);
        }

        UUID companyId = dto.getCompanyId() != null ? dto.getCompanyId() : DEFAULT_COMPANY_ID;
        String generatedBy = dto.getGeneratedBy() != null && !dto.getGeneratedBy().trim().isEmpty() 
                ? dto.getGeneratedBy().trim() 
                : "System Administrator";

        SavedReport savedReport = SavedReport.builder()
                .name(dto.getName().trim())
                .type(dto.getType().toLowerCase().trim())
                .generatedBy(generatedBy)
                .companyId(companyId)
                .build();

        SavedReport saved = savedReportRepository.save(savedReport);
        return mapToDto(saved);
    }

    public void deleteSavedReport(UUID id) {
        SavedReport report = savedReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved report with ID '" + id + "' not found"));
        savedReportRepository.delete(report);
    }

    public Map<String, Object> generateFleetReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<?> vehicles = new ArrayList<>();
        try {
            vehicles = restTemplate.getForObject("http://fleet-service/api/v1/fleet/vehicles?companyId=" + effectiveCompanyId, List.class);
        } catch (Exception e) {
            log.warn("Failed to fetch vehicles from fleet-service for fleet report: {}", e.getMessage());
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Fleet Utilization");
        report.put("generatedAt", LocalDateTime.now());
        report.put("companyId", effectiveCompanyId);
        report.put("totalVehicles", vehicles != null ? vehicles.size() : 0);
        report.put("vehicles", vehicles != null ? vehicles : Collections.emptyList());

        autoSaveAuditReport("Fleet Utilization Report - " + LocalDate.now(), "fleet", effectiveCompanyId);
        return report;
    }

    public Map<String, Object> generateDriverReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<?> drivers = new ArrayList<>();
        try {
            drivers = restTemplate.getForObject("http://driver-service/api/v1/driver?companyId=" + effectiveCompanyId, List.class);
        } catch (Exception e) {
            log.warn("Failed to fetch drivers from driver-service for driver report: {}", e.getMessage());
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Driver Compliance & Performance");
        report.put("generatedAt", LocalDateTime.now());
        report.put("companyId", effectiveCompanyId);
        report.put("totalDrivers", drivers != null ? drivers.size() : 0);
        report.put("drivers", drivers != null ? drivers : Collections.emptyList());

        autoSaveAuditReport("Driver Compliance Report - " + LocalDate.now(), "driver", effectiveCompanyId);
        return report;
    }

    public Map<String, Object> generateFuelReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<?> expenses = new ArrayList<>();
        try {
            expenses = restTemplate.getForObject("http://expense-service/api/v1/expense?companyId=" + effectiveCompanyId, List.class);
        } catch (Exception e) {
            log.warn("Failed to fetch expenses from expense-service for fuel report: {}", e.getMessage());
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Fuel Cost Analysis");
        report.put("generatedAt", LocalDateTime.now());
        report.put("companyId", effectiveCompanyId);
        report.put("expenses", expenses != null ? expenses : Collections.emptyList());

        autoSaveAuditReport("Fuel Cost Analysis Report - " + LocalDate.now(), "fuel", effectiveCompanyId);
        return report;
    }

    public Map<String, Object> generateMaintenanceReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<?> logs = new ArrayList<>();
        try {
            logs = restTemplate.getForObject("http://maintenance-service/api/v1/maintenance?companyId=" + effectiveCompanyId, List.class);
        } catch (Exception e) {
            log.warn("Failed to fetch maintenance logs from maintenance-service: {}", e.getMessage());
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Maintenance Schedule and Expenses");
        report.put("generatedAt", LocalDateTime.now());
        report.put("companyId", effectiveCompanyId);
        report.put("totalLogs", logs != null ? logs.size() : 0);
        report.put("logs", logs != null ? logs : Collections.emptyList());

        autoSaveAuditReport("Maintenance Audit Report - " + LocalDate.now(), "maintenance", effectiveCompanyId);
        return report;
    }

    public Map<String, Object> generateTripReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;
        List<?> trips = new ArrayList<>();
        try {
            trips = restTemplate.getForObject("http://trip-service/api/v1/trip?companyId=" + effectiveCompanyId, List.class);
        } catch (Exception e) {
            log.warn("Failed to fetch trips from trip-service: {}", e.getMessage());
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Trip Dispatch & Revenue Analysis");
        report.put("generatedAt", LocalDateTime.now());
        report.put("companyId", effectiveCompanyId);
        report.put("totalTrips", trips != null ? trips.size() : 0);
        report.put("trips", trips != null ? trips : Collections.emptyList());

        autoSaveAuditReport("Trip Logistics Report - " + LocalDate.now(), "trip", effectiveCompanyId);
        return report;
    }

    public Map<String, Object> generateSummaryReport(UUID companyId) {
        UUID effectiveCompanyId = companyId != null ? companyId : DEFAULT_COMPANY_ID;

        List<?> vehicles = Collections.emptyList();
        List<?> drivers = Collections.emptyList();
        List<?> trips = Collections.emptyList();
        List<?> expenses = Collections.emptyList();
        List<?> maintenance = Collections.emptyList();

        try {
            List<?> v = restTemplate.getForObject("http://fleet-service/api/v1/fleet/vehicles?companyId=" + effectiveCompanyId, List.class);
            if (v != null) vehicles = v;
        } catch (Exception e) {
            log.warn("Summary: fleet-service unavailable: {}", e.getMessage());
        }

        try {
            List<?> d = restTemplate.getForObject("http://driver-service/api/v1/driver?companyId=" + effectiveCompanyId, List.class);
            if (d != null) drivers = d;
        } catch (Exception e) {
            log.warn("Summary: driver-service unavailable: {}", e.getMessage());
        }

        try {
            List<?> t = restTemplate.getForObject("http://trip-service/api/v1/trip?companyId=" + effectiveCompanyId, List.class);
            if (t != null) trips = t;
        } catch (Exception e) {
            log.warn("Summary: trip-service unavailable: {}", e.getMessage());
        }

        try {
            List<?> exp = restTemplate.getForObject("http://expense-service/api/v1/expense?companyId=" + effectiveCompanyId, List.class);
            if (exp != null) expenses = exp;
        } catch (Exception e) {
            log.warn("Summary: expense-service unavailable: {}", e.getMessage());
        }

        try {
            List<?> m = restTemplate.getForObject("http://maintenance-service/api/v1/maintenance?companyId=" + effectiveCompanyId, List.class);
            if (m != null) maintenance = m;
        } catch (Exception e) {
            log.warn("Summary: maintenance-service unavailable: {}", e.getMessage());
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("reportType", "Executive Fleet & Financial Summary");
        summary.put("generatedAt", LocalDateTime.now());
        summary.put("companyId", effectiveCompanyId);
        summary.put("totalVehicles", vehicles.size());
        summary.put("totalDrivers", drivers.size());
        summary.put("totalTrips", trips.size());
        summary.put("totalExpensesCount", expenses.size());
        summary.put("totalMaintenanceCount", maintenance.size());

        autoSaveAuditReport("Executive Summary Report - " + LocalDate.now(), "summary", effectiveCompanyId);
        return summary;
    }

    private void autoSaveAuditReport(String name, String type, UUID companyId) {
        try {
            savedReportRepository.save(SavedReport.builder()
                    .name(name)
                    .type(type)
                    .generatedBy("System Administrator")
                    .companyId(companyId)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to audit auto-save report: {}", e.getMessage());
        }
    }

    private SavedReportDto mapToDto(SavedReport report) {
        return SavedReportDto.builder()
                .id(report.getId())
                .name(report.getName())
                .type(report.getType())
                .generatedBy(report.getGeneratedBy())
                .companyId(report.getCompanyId())
                .generatedAt(report.getGeneratedAt())
                .build();
    }
}
