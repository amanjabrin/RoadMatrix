package com.roadmatrix.report_service.service;

import com.roadmatrix.report_service.entity.SavedReport;
import com.roadmatrix.report_service.repository.SavedReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final SavedReportRepository savedReportRepository;
    private final RestTemplate restTemplate;

    public List<SavedReport> getSavedReports(UUID companyId) {
        return savedReportRepository.findByCompanyId(companyId);
    }

    public Map<String, Object> generateFleetReport(UUID companyId) {
        List<?> vehicles = new ArrayList<>();
        try {
            vehicles = restTemplate.getForObject("http://fleet-service/api/v1/fleet/vehicles?companyId=" + companyId, List.class);
        } catch (Exception e) {
            log.error("Failed to fetch vehicles for fleet report", e);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Fleet Utilization");
        report.put("generatedAt", new Date());
        report.put("totalVehicles", vehicles != null ? vehicles.size() : 0);
        report.put("vehicles", vehicles);

        // Audit save
        savedReportRepository.save(SavedReport.builder()
                .name("Fleet Utilization Report - " + LocalDateString())
                .type("fleet")
                .generatedBy("System Administrator")
                .companyId(companyId)
                .build());

        return report;
    }

    public Map<String, Object> generateDriverReport(UUID companyId) {
        List<?> drivers = new ArrayList<>();
        try {
            drivers = restTemplate.getForObject("http://driver-service/api/v1/driver?companyId=" + companyId, List.class);
        } catch (Exception e) {
            log.error("Failed to fetch drivers for driver report", e);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Driver Compliance & Performance");
        report.put("generatedAt", new Date());
        report.put("totalDrivers", drivers != null ? drivers.size() : 0);
        report.put("drivers", drivers);

        // Audit save
        savedReportRepository.save(SavedReport.builder()
                .name("Driver Compliance Report - " + LocalDateString())
                .type("driver")
                .generatedBy("System Administrator")
                .companyId(companyId)
                .build());

        return report;
    }

    public Map<String, Object> generateFuelReport(UUID companyId) {
        // Fetch expenses categorized under 'fuel'
        List<?> expenses = new ArrayList<>();
        try {
            expenses = restTemplate.getForObject("http://expense-service/api/v1/expense?companyId=" + companyId, List.class);
        } catch (Exception e) {
            log.error("Failed to fetch expenses for fuel report", e);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Fuel Cost Analysis");
        report.put("generatedAt", new Date());
        report.put("expenses", expenses);

        // Audit save
        savedReportRepository.save(SavedReport.builder()
                .name("Fuel Analysis Report - " + LocalDateString())
                .type("fuel")
                .generatedBy("System Administrator")
                .companyId(companyId)
                .build());

        return report;
    }

    public Map<String, Object> generateMaintenanceReport(UUID companyId) {
        List<?> maintenanceLogs = new ArrayList<>();
        try {
            maintenanceLogs = restTemplate.getForObject("http://maintenance-service/api/v1/maintenance?companyId=" + companyId, List.class);
        } catch (Exception e) {
            log.error("Failed to fetch maintenance logs for maintenance report", e);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "Maintenance Schedule and Expenses");
        report.put("generatedAt", new Date());
        report.put("totalLogs", maintenanceLogs != null ? maintenanceLogs.size() : 0);
        report.put("logs", maintenanceLogs);

        // Audit save
        savedReportRepository.save(SavedReport.builder()
                .name("Maintenance Audit Report - " + LocalDateString())
                .type("maintenance")
                .generatedBy("System Administrator")
                .companyId(companyId)
                .build());

        return report;
    }

    private String LocalDateString() {
        return java.time.LocalDate.now().toString();
    }
}
