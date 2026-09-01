package com.roadmatrix.maintenance_service.controller;

import com.roadmatrix.maintenance_service.dto.MaintenanceLogDto;
import com.roadmatrix.maintenance_service.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<MaintenanceLogDto>> getLogs(@RequestParam(required = false) UUID companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(maintenanceService.getAllLogs(companyId));
        }
        return ResponseEntity.ok(maintenanceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceLogDto> getLog(@PathVariable UUID id) {
        return ResponseEntity.ok(maintenanceService.getLogById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceLogDto> createLog(@RequestBody MaintenanceLogDto dto) {
        return ResponseEntity.ok(maintenanceService.createLog(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        maintenanceService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
