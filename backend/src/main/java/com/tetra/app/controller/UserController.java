package com.tetra.app.controller;

import com.tetra.app.dto.CreateUserRequest;
import com.tetra.app.dto.UpdateUserRequest;
import com.tetra.app.model.Role;
import com.tetra.app.model.User;
import com.tetra.app.service.UserService;
import com.tetra.app.security.JwtUtil;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import javax.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> createUser(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @Valid @RequestBody CreateUserRequest request
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        try {
            Role userRole;
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid role. Allowed roles: ADMIN, LEARNER");
            }

            userService.createUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                userRole
            );

            return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        var users = userService.getAllUsers().stream()
            .map(u -> Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Update an existing user", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
        @PathVariable String id,
        @Valid @RequestBody UpdateUserRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        String requesterId;
        try {
            role = jwtUtil.extractRole(token);
            requesterId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role) && !id.equals(requesterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        var userOpt = userService.getUserByEmail(request.getEmail());
        java.util.UUID userId = java.util.UUID.fromString(id);
        var user = userService.getAllUsers().stream().filter(u -> u.getId().equals(userId)).findFirst().orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        try {
            User updated = userService.updateUser(
                user,
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getOldPassword()
            );
            java.util.Map<String, Object> response = java.util.Map.of(
                "id", updated.getId(),
                "name", updated.getName(),
                "email", updated.getEmail(),
                "role", updated.getRole().name()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Unexpected error: " + e.getMessage());
        }
    }
}