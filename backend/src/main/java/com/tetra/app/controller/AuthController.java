package com.tetra.app.controller;

import java.util.UUID;
import java.util.Set;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import com.tetra.app.model.Role;

import com.tetra.app.dto.LoginRequest;
import com.tetra.app.dto.LoginResponse;
import com.tetra.app.model.User;
import com.tetra.app.model.BlacklistedToken;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.service.PasswordHashingService;
import com.tetra.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public static UUID lastAdminId = null;
    public static Role lastAdminRole = null;

    private final UserService userService;
    private final PasswordHashingService passwordHashingService;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    private static final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    @Autowired
    public AuthController(
        UserService userService,
        PasswordHashingService passwordHashingService,
        JwtUtil jwtUtil,
        BlacklistedTokenRepository blacklistedTokenRepository
    ) {
        this.userService = userService;
        this.passwordHashingService = passwordHashingService;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.getUserByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        User user = userOpt.get();

        if (!passwordHashingService.verifyPassword(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        
        if (user.getRole() == Role.ADMIN) {
            lastAdminId = user.getId();
            lastAdminRole = user.getRole();
        }

        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getRole(), token));
    }

    protected boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        UUID userId;
        try {
            userId = UUID.fromString(jwtUtil.extractUserId(token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        blacklistedTokenRepository.save(new BlacklistedToken(token, userId));
        return ResponseEntity.ok("Logged out successfully. User ID: " + userId);
    }
}