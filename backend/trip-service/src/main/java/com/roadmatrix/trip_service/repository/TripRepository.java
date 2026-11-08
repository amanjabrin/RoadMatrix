package com.roadmatrix.trip_service.repository;

import com.roadmatrix.trip_service.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByCompanyId(UUID companyId);
    List<Trip> findByVehicleId(UUID vehicleId);
    List<Trip> findByDriverId(UUID driverId);
    List<Trip> findByStatus(String status);
    List<Trip> findByCompanyIdAndStatus(UUID companyId, String status);
    boolean existsByVehicleIdAndStatusIn(UUID vehicleId, Collection<String> statuses);
    boolean existsByDriverIdAndStatusIn(UUID driverId, Collection<String> statuses);
}
