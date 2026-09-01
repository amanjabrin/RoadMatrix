package com.roadmatrix.maintenance_service.service;

import com.roadmatrix.maintenance_service.dto.MaintenanceLogDto;
import com.roadmatrix.maintenance_service.entity.MaintenanceLog;
import com.roadmatrix.maintenance_service.exception.ResourceNotFoundException;
import com.roadmatrix.maintenance_service.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceService {

    private final MaintenanceLogRepository logRepository;
    private final RestTemplate restTemplate;

    public List<MaintenanceLogDto> getAllLogs(UUID companyId) {
        return logRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceLogDto> getAll() {
        return logRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MaintenanceLogDto getLogById(UUID id) {
        MaintenanceLog logEntity = logRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));
        return mapToDto(logEntity);
    }

    public MaintenanceLogDto createLog(MaintenanceLogDto dto) {
        MaintenanceLog logEntity = MaintenanceLog.builder()
                .vehicleId(dto.getVehicleId())
                .type(dto.getType())
                .description(dto.getDescription())
                .status("scheduled")
                .scheduledDate(dto.getScheduledDate() != null ? dto.getScheduledDate() : LocalDate.now())
                .cost(dto.getCost() != null ? dto.getCost() : 0.0)
                .serviceProvider(dto.getServiceProvider() != null ? dto.getServiceProvider() : "Local Workshop")
                .notes(dto.getNotes())
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();

        MaintenanceLog saved = logRepository.save(logEntity);
        // Automatically put vehicle in maintenance shop
        updateVehicleStatus(saved.getVehicleId(), "in_shop");
        
        return mapToDto(saved);
    }

    public void updateStatus(UUID id, String status) {
        MaintenanceLog logEntity = logRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));

        logEntity.setStatus(status);
        if ("completed".equals(status)) {
            logEntity.setCompletedDate(LocalDate.now());
            // Put vehicle back in available pool
            updateVehicleStatus(logEntity.getVehicleId(), "available");
        } else if ("in_progress".equals(status)) {
            updateVehicleStatus(logEntity.getVehicleId(), "in_shop");
        }

        logRepository.save(logEntity);
    }

    private void updateVehicleStatus(UUID vehicleId, String status) {
        try {
            restTemplate.put("http://fleet-service/api/v1/fleet/vehicles/" + vehicleId + "/status?status=" + status, null);
        } catch (Exception e) {
            log.error("Failed to update vehicle status for vehicle ID: " + vehicleId, e);
        }
    }

    private MaintenanceLogDto mapToDto(MaintenanceLog logEntity) {
        return MaintenanceLogDto.builder()
                .id(logEntity.getId())
                .vehicleId(logEntity.getVehicleId())
                .type(logEntity.getType())
                .description(logEntity.getDescription())
                .status(logEntity.getStatus())
                .scheduledDate(logEntity.getScheduledDate())
                .completedDate(logEntity.getCompletedDate())
                .cost(logEntity.getCost())
                .serviceProvider(logEntity.getServiceProvider())
                .notes(logEntity.getNotes())
                .companyId(logEntity.getCompanyId())
                .build();
    }
}
