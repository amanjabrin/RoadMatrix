package com.roadmatrix.fleet_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM vehicles", Integer.class);
        if (count != null && count == 0) {
            String insertSql = "INSERT INTO vehicles (id, name, model, license_plate, type, max_load_capacity, odometer, status, acquisition_cost, year, fuel_type, region, company_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            UUID companyId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            // Seed v1
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-111111111111"), "MH Fleet Truck 01", "Tata LPT 1613", "MH 12 AB 2345", "truck", 16000.0, 412300.0, "available", 1850000.0, 2022, "diesel", "West", companyId);
            // Seed v2
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-222222222222"), "MH Fleet Truck 02", "Ashok Leyland 2820", "MH 14 CD 5678", "truck", 28000.0, 298200.0, "in_shop", 2450000.0, 2023, "diesel", "West", companyId);
            // Seed v3
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-333333333333"), "DL Fleet Truck 01", "BharatBenz 1217R", "DL 01 EF 9988", "truck", 12000.0, 356400.0, "on_trip", 2100000.0, 2021, "diesel", "North", companyId);
            // Seed v4
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-444444444444"), "KA Fleet Truck 01", "Eicher Pro 2110", "KA 03 GH 4455", "truck", 11000.0, 189200.0, "available", 1720000.0, 2023, "diesel", "South", companyId);
            // Seed v5
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-555555555555"), "Mumbai Delivery Van 01", "Mahindra Bolero Pickup", "MH 02 JK 1122", "van", 1500.0, 86780.0, "on_trip", 980000.0, 2022, "diesel", "West", companyId);
            // Seed v6
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-666666666666"), "Delhi Delivery Van 01", "Maruti Suzuki Eeco Cargo", "DL 05 LM 3344", "van", 750.0, 129300.0, "available", 650000.0, 2023, "gasoline", "North", companyId);
            // Seed v7
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-777777777777"), "Bengaluru Delivery Van 01", "Tata Ace Gold", "KA 51 NP 7788", "van", 850.0, 45600.0, "available", 720000.0, 2024, "diesel", "South", companyId);
            // Seed v8
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-888888888888"), "Mumbai Bike 01", "Hero Splendor Plus", "MH 01 QR 9090", "bike", 60.0, 23400.0, "available", 85000.0, 2023, "gasoline", "West", companyId);
            // Seed v9
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-999999999999"), "Delhi Bike 01", "Honda Shine", "DL 09 ST 5566", "bike", 55.0, 18900.0, "available", 90000.0, 2024, "gasoline", "North", companyId);
            // Seed v10
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-aaaaaaaaaaaa"), "Bengaluru Bike 01", "TVS Star City", "KA 04 UV 7788", "bike", 50.0, 31200.0, "in_shop", 82000.0, 2022, "gasoline", "South", companyId);
            // Seed v11
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-bbbbbbbbbbbb"), "Chennai Line Haul", "Ashok Leyland Dost", "TN 10 WX 3344", "truck", 2000.0, 178900.0, "available", 1150000.0, 2021, "diesel", "South", companyId);
            // Seed v12
            jdbcTemplate.update(insertSql, UUID.fromString("c0a80101-1111-1111-1111-cccccccccccc"), "Kolkata Delivery Van 01", "Tata Yodha Pickup", "WB 02 YZ 6677", "van", 1700.0, 56700.0, "available", 1020000.0, 2023, "diesel", "East", companyId);
        }
    }
}
