package com.roadmatrix.trip_service.service;

import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.entity.Trip;
import com.roadmatrix.trip_service.exception.BadRequestException;
import com.roadmatrix.trip_service.exception.ResourceNotFoundException;
import com.roadmatrix.trip_service.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final RestTemplate restTemplate;

    public static final Set<String> VALID_STATUSES = Set.of("draft", "dispatched", "in_progress", "completed", "cancelled");
    public static final Set<String> ACTIVE_STATUSES = Set.of("dispatched", "in_progress");
    public static final Set<String> TERMINAL_STATUSES = Set.of("completed", "cancelled");

    private static final UUID DEFAULT_COMPANY_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    public List<TripDto> getTrips(UUID companyId, String status, UUID vehicleId, UUID driverId) {
        List<Trip> trips;
        if (companyId != null) {
            trips = tripRepository.findByCompanyId(companyId);
        } else {
            trips = tripRepository.findAll();
        }

        return trips.stream()
                .filter(t -> status == null || status.trim().equalsIgnoreCase(t.getStatus()))
                .filter(t -> vehicleId == null || vehicleId.equals(t.getVehicleId()))
                .filter(t -> driverId == null || driverId.equals(t.getDriverId()))
                .sorted(Comparator.comparing(Trip::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TripDto> getAllTrips(UUID companyId) {
        return getTrips(companyId, null, null, null);
    }

    public List<TripDto> getAll() {
        return getTrips(null, null, null, null);
    }

    public TripDto getTripById(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID '" + id + "' not found"));
        return mapToDto(trip);
    }

    public TripDto createTrip(TripDto dto) {
        if (dto.getVehicleId() == null) {
            throw new BadRequestException("Vehicle ID is required");
        }
        if (dto.getDriverId() == null) {
            throw new BadRequestException("Driver ID is required");
        }
        if (dto.getCargoWeight() == null || dto.getCargoWeight() <= 0) {
            throw new BadRequestException("Cargo weight must be greater than zero");
        }
        if (dto.getOrigin() == null || dto.getOrigin().trim().isEmpty()) {
            throw new BadRequestException("Origin location cannot be empty");
        }
        if (dto.getDestination() == null || dto.getDestination().trim().isEmpty()) {
            throw new BadRequestException("Destination location cannot be empty");
        }
        if (dto.getDistance() != null && dto.getDistance() < 0) {
            throw new BadRequestException("Distance cannot be negative");
        }
        if (dto.getRevenue() != null && dto.getRevenue() < 0) {
            throw new BadRequestException("Revenue cannot be negative");
        }

        String status = dto.getStatus() != null ? dto.getStatus().toLowerCase().trim() : "draft";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid trip status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
        }

        validateVehicleWithFleetService(dto.getVehicleId(), dto.getCargoWeight());

        if (ACTIVE_STATUSES.contains(status)) {
            boolean vehicleBusy = tripRepository.existsByVehicleIdAndStatusIn(dto.getVehicleId(), ACTIVE_STATUSES);
            if (vehicleBusy) {
                throw new BadRequestException("Vehicle already has an active trip in progress");
            }
        }

        LocalDateTime dispatchedAt = null;
        if (ACTIVE_STATUSES.contains(status)) {
            dispatchedAt = LocalDateTime.now();
        }

        Trip trip = Trip.builder()
                .vehicleId(dto.getVehicleId())
                .driverId(dto.getDriverId())
                .cargoWeight(dto.getCargoWeight())
                .origin(dto.getOrigin().trim())
                .destination(dto.getDestination().trim())
                .status(status)
                .dispatchedAt(dispatchedAt)
                .distance(dto.getDistance() != null ? dto.getDistance() : 250.0)
                .revenue(dto.getRevenue() != null ? dto.getRevenue() : 35000.0)
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : DEFAULT_COMPANY_ID)
                .build();

        Trip saved = tripRepository.save(trip);

        if (ACTIVE_STATUSES.contains(status)) {
            updateVehicleStatus(saved.getVehicleId(), "on_trip");
        }

        return mapToDto(saved);
    }

    public TripDto updateTrip(UUID id, TripDto dto) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID '" + id + "' not found"));

        if (TERMINAL_STATUSES.contains(trip.getStatus())) {
            throw new BadRequestException("Cannot update details for a " + trip.getStatus() + " trip");
        }

        if (dto.getOrigin() != null) {
            if (dto.getOrigin().trim().isEmpty()) {
                throw new BadRequestException("Origin location cannot be empty");
            }
            trip.setOrigin(dto.getOrigin().trim());
        }

        if (dto.getDestination() != null) {
            if (dto.getDestination().trim().isEmpty()) {
                throw new BadRequestException("Destination location cannot be empty");
            }
            trip.setDestination(dto.getDestination().trim());
        }

        if (dto.getCargoWeight() != null) {
            if (dto.getCargoWeight() <= 0) {
                throw new BadRequestException("Cargo weight must be greater than zero");
            }
            validateVehicleWithFleetService(trip.getVehicleId(), dto.getCargoWeight());
            trip.setCargoWeight(dto.getCargoWeight());
        }

        if (dto.getDistance() != null) {
            if (dto.getDistance() < 0) {
                throw new BadRequestException("Distance cannot be negative");
            }
            trip.setDistance(dto.getDistance());
        }

        if (dto.getRevenue() != null) {
            if (dto.getRevenue() < 0) {
                throw new BadRequestException("Revenue cannot be negative");
            }
            trip.setRevenue(dto.getRevenue());
        }

        if (dto.getStatus() != null && !dto.getStatus().equalsIgnoreCase(trip.getStatus())) {
            updateStatus(id, dto.getStatus(), null);
            trip = tripRepository.findById(id).orElseThrow();
        }

        Trip saved = tripRepository.save(trip);
        return mapToDto(saved);
    }

    public TripDto updateStatus(UUID id, String status, Double odometer) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID '" + id + "' not found"));

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Trip status cannot be empty");
        }

        String targetStatus = status.toLowerCase().trim();
        if (!VALID_STATUSES.contains(targetStatus)) {
            throw new BadRequestException("Invalid trip status '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        String currentStatus = trip.getStatus();
        if (currentStatus.equals(targetStatus)) {
            return mapToDto(trip);
        }

        validateStatusTransition(currentStatus, targetStatus);

        trip.setStatus(targetStatus);

        if ("dispatched".equals(targetStatus)) {
            boolean vehicleBusy = tripRepository.existsByVehicleIdAndStatusIn(trip.getVehicleId(), ACTIVE_STATUSES);
            if (vehicleBusy) {
                throw new BadRequestException("Vehicle is already assigned to another active trip");
            }
            if (trip.getDispatchedAt() == null) {
                trip.setDispatchedAt(LocalDateTime.now());
            }
            updateVehicleStatus(trip.getVehicleId(), "on_trip");
        } else if ("in_progress".equals(targetStatus)) {
            if (trip.getDispatchedAt() == null) {
                trip.setDispatchedAt(LocalDateTime.now());
            }
            updateVehicleStatus(trip.getVehicleId(), "on_trip");
        } else if ("completed".equals(targetStatus)) {
            trip.setCompletedAt(LocalDateTime.now());
            updateVehicleStatus(trip.getVehicleId(), "available");
            if (odometer != null) {
                if (odometer < 0) {
                    throw new BadRequestException("Odometer reading cannot be negative");
                }
                updateVehicleOdometer(trip.getVehicleId(), odometer);
            }
        } else if ("cancelled".equals(targetStatus)) {
            updateVehicleStatus(trip.getVehicleId(), "available");
        }

        Trip saved = tripRepository.save(trip);
        return mapToDto(saved);
    }

    public void deleteTrip(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID '" + id + "' not found"));

        if (ACTIVE_STATUSES.contains(trip.getStatus())) {
            throw new BadRequestException("Cannot delete an active trip (" + trip.getStatus() + "). Cancel the trip first.");
        }

        tripRepository.delete(trip);
    }

    private void validateStatusTransition(String current, String next) {
        if (TERMINAL_STATUSES.contains(current)) {
            throw new BadRequestException("Cannot change status of a " + current + " trip");
        }

        boolean valid = switch (current) {
            case "draft" -> "dispatched".equals(next) || "cancelled".equals(next);
            case "dispatched" -> "in_progress".equals(next) || "cancelled".equals(next);
            case "in_progress" -> "completed".equals(next) || "cancelled".equals(next);
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Invalid status transition from '" + current + "' to '" + next + "'");
        }
    }

    private void validateVehicleWithFleetService(UUID vehicleId, Double cargoWeight) {
        if (vehicleId == null) return;
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    "http://fleet-service/api/v1/fleet/vehicles/" + vehicleId,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> vehicle = response.getBody();

                Object statusObj = vehicle.get("status");
                if (statusObj instanceof String vStatus) {
                    if ("in_shop".equalsIgnoreCase(vStatus)) {
                        throw new BadRequestException("Vehicle is currently undergoing maintenance (in shop)");
                    }
                    if ("retired".equalsIgnoreCase(vStatus)) {
                        throw new BadRequestException("Vehicle is retired and cannot be assigned to trips");
                    }
                }

                Object capacityObj = vehicle.get("maxLoadCapacity");
                if (capacityObj instanceof Number capacity && cargoWeight != null) {
                    double maxCapacity = capacity.doubleValue();
                    if (cargoWeight > maxCapacity) {
                        throw new BadRequestException("Cargo weight (" + cargoWeight + " kg) exceeds vehicle max load capacity (" + maxCapacity + " kg)");
                    }
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (HttpClientErrorException.NotFound e) {
            throw new BadRequestException("Vehicle with ID '" + vehicleId + "' does not exist in fleet registry");
        } catch (Exception e) {
            log.warn("Fleet service vehicle verification skipped: {}", e.getMessage());
        }
    }

    private void updateVehicleStatus(UUID vehicleId, String status) {
        if (vehicleId == null) return;
        try {
            restTemplate.put("http://fleet-service/api/v1/fleet/vehicles/" + vehicleId + "/status?status=" + status, null);
            log.info("Updated vehicle {} status to {}", vehicleId, status);
        } catch (Exception e) {
            log.warn("Failed to update vehicle status for vehicle ID {}: {}", vehicleId, e.getMessage());
        }
    }

    private void updateVehicleOdometer(UUID vehicleId, Double odometer) {
        if (vehicleId == null || odometer == null) return;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("odometer", odometer);
            restTemplate.put("http://fleet-service/api/v1/fleet/vehicles/" + vehicleId, body);
            log.info("Updated vehicle {} odometer to {}", vehicleId, odometer);
        } catch (Exception e) {
            log.warn("Failed to update vehicle odometer for vehicle ID {}: {}", vehicleId, e.getMessage());
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
