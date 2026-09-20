package com.roadmatrix.fleet_service.service;

import com.roadmatrix.fleet_service.dto.VehicleDto;
import com.roadmatrix.fleet_service.entity.Vehicle;
import com.roadmatrix.fleet_service.exception.BadRequestException;
import com.roadmatrix.fleet_service.exception.ResourceNotFoundException;
import com.roadmatrix.fleet_service.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    private static final Set<String> VALID_TYPES = Set.of("truck", "van", "bike");
    private static final Set<String> VALID_STATUSES = Set.of("available", "on_trip", "in_shop", "retired");
    private static final Set<String> VALID_FUEL_TYPES = Set.of("diesel", "gasoline", "electric");

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
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID '" + id + "' not found"));
        return mapToDto(vehicle);
    }

    public VehicleDto createVehicle(VehicleDto dto) {
        String type = dto.getType().toLowerCase().trim();
        if (!VALID_TYPES.contains(type)) {
            throw new BadRequestException("Invalid vehicle type '" + dto.getType() + "'. Allowed values: " + VALID_TYPES);
        }

        String fuelType = dto.getFuelType().toLowerCase().trim();
        if (!VALID_FUEL_TYPES.contains(fuelType)) {
            throw new BadRequestException("Invalid fuel type '" + dto.getFuelType() + "'. Allowed values: " + VALID_FUEL_TYPES);
        }

        String status = dto.getStatus() != null ? dto.getStatus().toLowerCase().trim() : "available";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid vehicle status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
        }

        Vehicle vehicle = Vehicle.builder()
                .name(dto.getName().trim())
                .model(dto.getModel().trim())
                .licensePlate(dto.getLicensePlate().trim())
                .type(type)
                .maxLoadCapacity(dto.getMaxLoadCapacity())
                .odometer(dto.getOdometer() != null ? dto.getOdometer() : 0.0)
                .status(status)
                .acquisitionCost(dto.getAcquisitionCost() != null ? dto.getAcquisitionCost() : 0.0)
                .year(dto.getYear())
                .fuelType(fuelType)
                .region(dto.getRegion() != null && !dto.getRegion().trim().isEmpty() ? dto.getRegion().trim() : "West")
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public VehicleDto updateVehicle(UUID id, VehicleDto dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID '" + id + "' not found"));
        
        if (dto.getName() != null && !dto.getName().trim().isEmpty()) vehicle.setName(dto.getName().trim());
        if (dto.getModel() != null && !dto.getModel().trim().isEmpty()) vehicle.setModel(dto.getModel().trim());
        if (dto.getLicensePlate() != null && !dto.getLicensePlate().trim().isEmpty()) vehicle.setLicensePlate(dto.getLicensePlate().trim());
        if (dto.getType() != null) {
            String type = dto.getType().toLowerCase().trim();
            if (!VALID_TYPES.contains(type)) {
                throw new BadRequestException("Invalid vehicle type '" + dto.getType() + "'. Allowed values: " + VALID_TYPES);
            }
            vehicle.setType(type);
        }
        if (dto.getMaxLoadCapacity() != null) {
            if (dto.getMaxLoadCapacity() <= 0) throw new BadRequestException("Max load capacity must be greater than zero");
            vehicle.setMaxLoadCapacity(dto.getMaxLoadCapacity());
        }
        if (dto.getOdometer() != null) {
            if (dto.getOdometer() < 0) throw new BadRequestException("Odometer reading cannot be negative");
            vehicle.setOdometer(dto.getOdometer());
        }
        if (dto.getStatus() != null) {
            String status = dto.getStatus().toLowerCase().trim();
            if (!VALID_STATUSES.contains(status)) {
                throw new BadRequestException("Invalid status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
            }
            vehicle.setStatus(status);
        }
        if (dto.getAcquisitionCost() != null) {
            if (dto.getAcquisitionCost() < 0) throw new BadRequestException("Acquisition cost cannot be negative");
            vehicle.setAcquisitionCost(dto.getAcquisitionCost());
        }
        if (dto.getYear() != null) {
            if (dto.getYear() < 1900) throw new BadRequestException("Invalid manufacturing year");
            vehicle.setYear(dto.getYear());
        }
        if (dto.getFuelType() != null) {
            String fuelType = dto.getFuelType().toLowerCase().trim();
            if (!VALID_FUEL_TYPES.contains(fuelType)) {
                throw new BadRequestException("Invalid fuel type '" + dto.getFuelType() + "'. Allowed values: " + VALID_FUEL_TYPES);
            }
            vehicle.setFuelType(fuelType);
        }
        if (dto.getRegion() != null) vehicle.setRegion(dto.getRegion().trim());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    public void updateStatus(UUID id, String status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID '" + id + "' not found"));
        String normalizedStatus = status != null ? status.toLowerCase().trim() : "";
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid status '" + status + "'. Allowed values: " + VALID_STATUSES);
        }
        vehicle.setStatus(normalizedStatus);
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
