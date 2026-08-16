package com.roadmatrix.trip_service.service;

import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.entity.Trip;
import com.roadmatrix.trip_service.exception.ResourceNotFoundException;
import com.roadmatrix.trip_service.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final RestTemplate restTemplate;

    public List<TripDto> getAllTrips(UUID companyId) {
        return tripRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TripDto> getAll() {
        return tripRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TripDto getTripById(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        return mapToDto(trip);
    }

    public TripDto createTrip(TripDto dto) {
        Trip trip = Trip.builder()
                .vehicleId(dto.getVehicleId())
                .driverId(dto.getDriverId())
                .cargoWeight(dto.getCargoWeight())
                .origin(dto.getOrigin())
                .destination(dto.getDestination())
                .status("draft")
                .distance(dto.getDistance() != null ? dto.getDistance() : 250.0)
                .revenue(dto.getRevenue() != null ? dto.getRevenue() : 35000.0)
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Trip saved = tripRepository.save(trip);
        return mapToDto(saved);
    }

    public TripDto updateTrip(UUID id, TripDto dto) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (dto.getOrigin() != null) trip.setOrigin(dto.getOrigin());
        if (dto.getDestination() != null) trip.setDestination(dto.getDestination());
        if (dto.getCargoWeight() != null) trip.setCargoWeight(dto.getCargoWeight());
        if (dto.getDistance() != null) trip.setDistance(dto.getDistance());
        if (dto.getRevenue() != null) trip.setRevenue(dto.getRevenue());
        if (dto.getStatus() != null) trip.setStatus(dto.getStatus());

        Trip saved = tripRepository.save(trip);
        return mapToDto(saved);
    }

    public void updateStatus(UUID id, String status, Double odometer) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        trip.setStatus(status);
        if ("dispatched".equals(status) || "in_progress".equals(status)) {
            trip.setDispatchedAt(LocalDateTime.now());
            updateVehicleStatus(trip.getVehicleId(), "on_trip");
        } else if ("completed".equals(status)) {
            trip.setCompletedAt(LocalDateTime.now());
            updateVehicleStatus(trip.getVehicleId(), "available");
            if (odometer != null) {
                updateVehicleOdometer(trip.getVehicleId(), odometer);
            }
        } else if ("cancelled".equals(status)) {
            updateVehicleStatus(trip.getVehicleId(), "available");
        }

        tripRepository.save(trip);
    }

    private void updateVehicleStatus(UUID vehicleId, String status) {
        try {
            restTemplate.put("http://fleet-service/api/v1/fleet/vehicles/" + vehicleId + "/status?status=" + status, null);
        } catch (Exception e) {
            log.error("Failed to update vehicle status for vehicle ID: " + vehicleId, e);
        }
    }

    private void updateVehicleOdometer(UUID vehicleId, Double odometer) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("odometer", odometer);
            restTemplate.put("http://fleet-service/api/v1/fleet/vehicles/" + vehicleId, body);
        } catch (Exception e) {
            log.error("Failed to update vehicle odometer for vehicle ID: " + vehicleId, e);
        }
    }

    private TripDto mapToDto(Trip trip) {
        return TripDto.builder()
                .id(trip.getId())
                .vehicleId(trip.getVehicleId())
                .driverId(trip.getDriverId())
                .cargoWeight(trip.getCargoWeight())
                .origin(trip.getOrigin())
                .destination(trip.getDestination())
                .status(trip.getStatus())
                .createdAt(trip.getCreatedAt())
                .dispatchedAt(trip.getDispatchedAt())
                .completedAt(trip.getCompletedAt())
                .distance(trip.getDistance())
                .revenue(trip.getRevenue())
                .companyId(trip.getCompanyId())
                .build();
    }
}
