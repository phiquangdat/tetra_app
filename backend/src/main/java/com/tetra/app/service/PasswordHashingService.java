package com.tetra.app.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordHashingService {

    private final PasswordEncoder passwordEncoder;

    public PasswordHashingService() {
        this.passwordEncoder = new BCryptPasswordEncoder(); // Можно передать strength: new BCryptPasswordEncoder(12)
    }

    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }

    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
}
