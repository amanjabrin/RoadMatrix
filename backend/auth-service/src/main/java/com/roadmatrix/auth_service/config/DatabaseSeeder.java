package com.roadmatrix.auth_service.config;

import com.roadmatrix.auth_service.entity.User;
import com.roadmatrix.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("password");

            userRepository.save(User.builder()
                    .email("manager@roadmatrix.in")
                    .name("Rajesh Sharma")
                    .role("fleet_manager")
                    .password(defaultPassword)
                    .companyId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .build());

            userRepository.save(User.builder()
                    .email("dispatcher@roadmatrix.in")
                    .name("Priya Nair")
                    .role("dispatcher")
                    .password(defaultPassword)
                    .companyId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .build());

            userRepository.save(User.builder()
                    .email("safety@roadmatrix.in")
                    .name("Anil Verma")
                    .role("safety_officer")
                    .password(defaultPassword)
                    .companyId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .build());

            userRepository.save(User.builder()
                    .email("finance@roadmatrix.in")
                    .name("Kavita Iyer")
                    .role("financial_analyst")
                    .password(defaultPassword)
                    .companyId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .build());

            userRepository.save(User.builder()
                    .email("admin@roadmatrix.in")
                    .name("Super Admin")
                    .role("fleet_manager")
                    .password(defaultPassword)
                    .companyId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .build());
        }
    }
}
