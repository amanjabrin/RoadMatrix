package com.roadmatrix.driver_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM drivers", Integer.class);
        if (count != null && count == 0) {
            String insertDriverSql = "INSERT INTO drivers (id, name, email, phone, license_number, license_expiry, status, safety_score, join_date, total_trips, completed_trips, company_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            String insertCategorySql = "INSERT INTO driver_license_categories (driver_id, category) VALUES (?, ?)";

            UUID companyId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            // d1
            UUID d1 = UUID.fromString("d0a80101-1111-1111-1111-111111111111");
            jdbcTemplate.update(insertDriverSql, d1, "Suresh Kumar", "suresh.kumar@roadmatrix.in", "+91-98765-01010", "DL-03-2020-001", LocalDate.parse("2027-08-12"), "on_duty", 92, LocalDate.parse("2022-01-15"), 245, 238, companyId);
            jdbcTemplate.update(insertCategorySql, d1, "truck");
            jdbcTemplate.update(insertCategorySql, d1, "van");

            // d2
            UUID d2 = UUID.fromString("d0a80101-1111-1111-1111-222222222222");
            jdbcTemplate.update(insertDriverSql, d2, "Rahul Yadav", "rahul.yadav@roadmatrix.in", "+91-98201-02020", "MH-12-2019-114", LocalDate.parse("2026-05-20"), "on_duty", 88, LocalDate.parse("2021-03-10"), 189, 185, companyId);
            jdbcTemplate.update(insertCategorySql, d2, "van");
            jdbcTemplate.update(insertCategorySql, d2, "bike");

            // d3
            UUID d3 = UUID.fromString("d0a80101-1111-1111-1111-333333333333");
            jdbcTemplate.update(insertDriverSql, d3, "Amit Singh", "amit.singh@roadmatrix.in", "+91-98111-03030", "DL-08-2018-332", LocalDate.parse("2026-12-10"), "off_duty", 81, LocalDate.parse("2020-11-20"), 312, 298, companyId);
            jdbcTemplate.update(insertCategorySql, d3, "truck");

            // d4
            UUID d4 = UUID.fromString("d0a80101-1111-1111-1111-444444444444");
            jdbcTemplate.update(insertDriverSql, d4, "Manoj Pillai", "manoj.pillai@roadmatrix.in", "+91-99777-04040", "KA-01-2021-556", LocalDate.parse("2027-09-03"), "on_duty", 95, LocalDate.parse("2022-06-01"), 156, 154, companyId);
            jdbcTemplate.update(insertCategorySql, d4, "truck");
            jdbcTemplate.update(insertCategorySql, d4, "van");
            jdbcTemplate.update(insertCategorySql, d4, "bike");

            // d5
            UUID d5 = UUID.fromString("d0a80101-1111-1111-1111-555555555555");
            jdbcTemplate.update(insertDriverSql, d5, "Imran Shaikh", "imran.shaikh@roadmatrix.in", "+91-98989-05050", "MH-01-2020-778", LocalDate.parse("2026-11-15"), "on_duty", 89, LocalDate.parse("2021-08-12"), 134, 132, companyId);
            jdbcTemplate.update(insertCategorySql, d5, "van");
            jdbcTemplate.update(insertCategorySql, d5, "bike");

            // d6
            UUID d6 = UUID.fromString("d0a80101-1111-1111-1111-666666666666");
            jdbcTemplate.update(insertDriverSql, d6, "Vijay Reddy", "vijay.reddy@roadmatrix.in", "+91-90000-06060", "TS-09-2019-221", LocalDate.parse("2025-10-30"), "suspended", 72, LocalDate.parse("2023-01-10"), 89, 82, companyId);
            jdbcTemplate.update(insertCategorySql, d6, "bike");

            // d7
            UUID d7 = UUID.fromString("d0a80101-1111-1111-1111-777777777777");
            jdbcTemplate.update(insertDriverSql, d7, "Harpreet Kaur", "harpreet.kaur@roadmatrix.in", "+91-98188-07070", "PB-10-2017-909", LocalDate.parse("2028-01-20"), "on_duty", 94, LocalDate.parse("2019-09-05"), 378, 371, companyId);
            jdbcTemplate.update(insertCategorySql, d7, "truck");
            jdbcTemplate.update(insertCategorySql, d7, "van");

            // d8
            UUID d8 = UUID.fromString("d0a80101-1111-1111-1111-888888888888");
            jdbcTemplate.update(insertDriverSql, d8, "Sneha Patil", "sneha.patil@roadmatrix.in", "+91-97676-08080", "MH-15-2022-443", LocalDate.parse("2027-07-08"), "off_duty", 86, LocalDate.parse("2023-11-15"), 98, 96, companyId);
            jdbcTemplate.update(insertCategorySql, d8, "van");
        }
    }
}
