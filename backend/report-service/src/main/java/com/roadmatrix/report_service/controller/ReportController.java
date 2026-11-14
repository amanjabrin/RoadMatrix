package com.roadmatrix.report_service.controller;

import com.roadmatrix.report_service.dto.SavedReportDto;
import com.roadmatrix.report_service.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/report", "/api/v1/reports"})
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummaryReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateSummaryReport(companyId));
    }

    @GetMapping("/fleet")
    public ResponseEntity<Map<String, Object>> getFleetReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateFleetReport(companyId));
    }

    @GetMapping("/driver")
    public ResponseEntity<Map<String, Object>> getDriverReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateDriverReport(companyId));
    }

    @GetMapping("/fuel")
    public ResponseEntity<Map<String, Object>> getFuelReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateFuelReport(companyId));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateMaintenanceReport(companyId));
    }

    @GetMapping("/trip")
    public ResponseEntity<Map<String, Object>> getTripReport(@RequestParam(required = false) UUID companyId) {
        return ResponseEntity.ok(reportService.generateTripReport(companyId));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedReportDto>> getSavedReports(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(reportService.getSavedReports(companyId, type));
    }

    @GetMapping("/saved/{id}")
    public ResponseEntity<SavedReportDto> getSavedReport(@PathVariable UUID id) {
        return ResponseEntity.ok(reportService.getSavedReportById(id));
    }

    @PostMapping("/saved")
    public ResponseEntity<SavedReportDto> saveReport(@Valid @RequestBody SavedReportDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.saveReport(dto));
    }

    @DeleteMapping("/saved/{id}")
    public ResponseEntity<Void> deleteSavedReport(@PathVariable UUID id) {
        reportService.deleteSavedReport(id);
        return ResponseEntity.noContent().build();
    }
}
