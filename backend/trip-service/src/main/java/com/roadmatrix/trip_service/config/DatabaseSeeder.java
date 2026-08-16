package com.roadmatrix.trip_service.config;

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
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM trips", Integer.class);
        if (count != null && count == 0) {
            String insertSql = "INSERT INTO trips (id, vehicle_id, driver_id, cargo_weight, origin, destination, status, distance, revenue, company_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            UUID companyId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            UUID v1 = UUID.fromString("c0a80101-1111-1111-1111-111111111111");
            UUID v3 = UUID.fromString("c0a80101-1111-1111-1111-333333333333");
            UUID v4 = UUID.fromString("c0a80101-1111-1111-1111-444444444444");
            UUID v5 = UUID.fromString("c0a80101-1111-1111-1111-555555555555");
            UUID v6 = UUID.fromString("c0a80101-1111-1111-1111-666666666666");
            UUID v7 = UUID.fromString("c0a80101-1111-1111-1111-777777777777");
            UUID v8 = UUID.fromString("c0a80101-1111-1111-1111-888888888888");
            UUID v9 = UUID.fromString("c0a80101-1111-1111-1111-999999999999");
            UUID v11 = UUID.fromString("c0a80101-1111-1111-1111-bbbbbbbbbbbb");
            UUID v12 = UUID.fromString("c0a80101-1111-1111-1111-cccccccccccc");

            UUID d1 = UUID.fromString("d0a80101-1111-1111-1111-111111111111");
            UUID d2 = UUID.fromString("d0a80101-1111-1111-1111-222222222222");
            UUID d4 = UUID.fromString("d0a80101-1111-1111-1111-444444444444");
            UUID d5 = UUID.fromString("d0a80101-1111-1111-1111-555555555555");
            UUID d7 = UUID.fromString("d0a80101-1111-1111-1111-777777777777");
            UUID d8 = UUID.fromString("d0a80101-1111-1111-1111-888888888888");

            // t1
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-111111111111"), v3, d1, 11800.0, "Delhi, Delhi", "Jaipur, Rajasthan", "in_progress", 280.0, 52000.0, companyId);
            // t2
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-222222222222"), v5, d2, 1200.0, "Mumbai, Maharashtra", "Pune, Maharashtra", "in_progress", 150.0, 18000.0, companyId);
            // t3
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-333333333333"), v1, d4, 14500.0, "Mumbai, Maharashtra", "Ahmedabad, Gujarat", "completed", 530.0, 95000.0, companyId);
            // t4
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-444444444444"), v6, d5, 650.0, "Delhi, Delhi", "Noida, Uttar Pradesh", "completed", 40.0, 8500.0, companyId);
            // t5
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-555555555555"), v4, d7, 9800.0, "Bengaluru, Karnataka", "Chennai, Tamil Nadu", "draft", 350.0, 62000.0, companyId);
            // t6
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-666666666666"), v7, d2, 800.0, "Bengaluru, Karnataka", "Mysuru, Karnataka", "dispatched", 150.0, 16000.0, companyId);
            // t7
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-777777777777"), v9, d5, 35.0, "Delhi, Delhi", "Gurugram, Haryana", "completed", 30.0, 3500.0, companyId);
            // t8
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-888888888888"), v11, d1, 1800.0, "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "cancelled", 500.0, 54000.0, companyId);
            // t9
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-999999999999"), v8, d4, 40.0, "Mumbai, Maharashtra", "Thane, Maharashtra", "completed", 25.0, 2800.0, companyId);
            // t10
            jdbcTemplate.update(insertSql, UUID.fromString("b0a80101-1111-1111-1111-aaaaaaaaaaaa"), v12, d8, 1200.0, "Kolkata, West Bengal", "Durgapur, West Bengal", "draft", 170.0, 19000.0, companyId);
        }
    }
}
