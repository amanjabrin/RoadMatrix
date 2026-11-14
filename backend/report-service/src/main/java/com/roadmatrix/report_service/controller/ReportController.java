package com.roadmatrix.report_service.controller;

import com.roadmatrix.report_service.entity.SavedReport;
import com.roadmatrix.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/saved")
    public ResponseEntity<List<SavedReport>> getSavedReports(@RequestParam UUID companyId) {
        return ResponseEntity.ok(reportService.getSavedReports(companyId));
    }

    @GetMapping("/fleet")
    public ResponseEntity<Map<String, Object>> getFleetReport(@RequestParam UUID companyId) {
        return ResponseEntity.ok(reportService.generateFleetReport(companyId));
    }

    @GetMapping("/driver")
    public ResponseEntity<Map<String, Object>> getDriverReport(@RequestParam UUID companyId) {
        return ResponseEntity.ok(reportService.generateDriverReport(companyId));
    }

    @GetMapping("/fuel")
    public ResponseEntity<Map<String, Object>> getFuelReport(@RequestParam UUID companyId) {
        return ResponseEntity.ok(reportService.generateFuelReport(companyId));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceReport(@RequestParam UUID companyId) {
        return ResponseEntity.ok(reportService.generateMaintenanceReport(companyId));
    }
}
