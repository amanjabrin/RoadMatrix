package com.roadmatrix.trip_service.controller;

import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/trip", "/api/v1/trips"})
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<List<TripDto>> getTrips(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId
    ) {
        return ResponseEntity.ok(tripService.getTrips(companyId, status, vehicleId, driverId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PostMapping
    public ResponseEntity<TripDto> createTrip(@Valid @RequestBody TripDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDto> updateTrip(@PathVariable UUID id, @Valid @RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.updateTrip(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TripDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Double odometer
    ) {
        return ResponseEntity.ok(tripService.updateStatus(id, status, odometer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }
}
