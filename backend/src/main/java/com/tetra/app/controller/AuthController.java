package com.tetra.app.controller;

import com.tetra.app.dto.LoginRequest;
import com.tetra.app.dto.LoginResponse;
import com.tetra.app.model.User;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.service.PasswordHashingService;
import com.tetra.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordHashingService passwordHashingService;

    @Autowired
    private JwtUtil jwtUtil;

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

        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getRole(), token));
    }
}