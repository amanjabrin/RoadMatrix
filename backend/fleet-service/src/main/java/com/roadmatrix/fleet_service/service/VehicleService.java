package com.roadmatrix.fleet_service.service;

import com.roadmatrix.fleet_service.dto.VehicleDto;
import com.roadmatrix.fleet_service.entity.Vehicle;
import com.roadmatrix.fleet_service.exception.ResourceNotFoundException;
import com.roadmatrix.fleet_service.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleDto> getAllVehicles(UUID companyId) {
        return vehicleRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return mapToDto(vehicle);
    }

    public VehicleDto createVehicle(VehicleDto dto) {
        Vehicle vehicle = Vehicle.builder()
                .name(dto.getName())
                .model(dto.getModel())
                .licensePlate(dto.getLicensePlate())
                .type(dto.getType())
                .maxLoadCapacity(dto.getMaxLoadCapacity())
                .odometer(dto.getOdometer() != null ? dto.getOdometer() : 0.0)
                .status(dto.getStatus() != null ? dto.getStatus() : "available")
                .acquisitionCost(dto.getAcquisitionCost())
                .year(dto.getYear())
                .fuelType(dto.getFuelType())
                .region(dto.getRegion() != null ? dto.getRegion() : "West")
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public VehicleDto updateVehicle(UUID id, VehicleDto dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        
        if (dto.getName() != null) vehicle.setName(dto.getName());
        if (dto.getModel() != null) vehicle.setModel(dto.getModel());
        if (dto.getLicensePlate() != null) vehicle.setLicensePlate(dto.getLicensePlate());
        if (dto.getType() != null) vehicle.setType(dto.getType());
        if (dto.getMaxLoadCapacity() != null) vehicle.setMaxLoadCapacity(dto.getMaxLoadCapacity());
        if (dto.getOdometer() != null) vehicle.setOdometer(dto.getOdometer());
        if (dto.getStatus() != null) vehicle.setStatus(dto.getStatus());
        if (dto.getAcquisitionCost() != null) vehicle.setAcquisitionCost(dto.getAcquisitionCost());
        if (dto.getYear() != null) vehicle.setYear(dto.getYear());
        if (dto.getFuelType() != null) vehicle.setFuelType(dto.getFuelType());
        if (dto.getRegion() != null) vehicle.setRegion(dto.getRegion());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public void updateStatus(UUID id, String status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(UUID id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .name(vehicle.getName())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .type(vehicle.getType())
                .maxLoadCapacity(vehicle.getMaxLoadCapacity())
                .odometer(vehicle.getOdometer())
                .status(vehicle.getStatus())
                .acquisitionCost(vehicle.getAcquisitionCost())
                .year(vehicle.getYear())
                .fuelType(vehicle.getFuelType())
                .region(vehicle.getRegion())
                .companyId(vehicle.getCompanyId())
                .build();
    }
}
