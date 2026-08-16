package com.roadmatrix.driver_service.controller;

import com.roadmatrix.driver_service.dto.DriverDto;
import com.roadmatrix.driver_service.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<List<DriverDto>> getDrivers(@RequestParam(required = false) UUID companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(driverService.getAllDrivers(companyId));
        }
        return ResponseEntity.ok(driverService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDto> getDriver(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    public ResponseEntity<DriverDto> createDriver(@RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.createDriver(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDto> updateDriver(@PathVariable UUID id, @RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.updateDriver(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        driverService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable UUID id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok().build();
    }
}
