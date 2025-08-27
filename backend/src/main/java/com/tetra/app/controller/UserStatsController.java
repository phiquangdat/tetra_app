package com.tetra.app.controller;

import com.tetra.app.service.UserStatsService;
import com.tetra.app.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-stats")
public class UserStatsController {
    private final UserStatsService userStatsService;
    private final JwtUtil jwtUtil;

    public UserStatsController(UserStatsService userStatsService, JwtUtil jwtUtil) {
        this.userStatsService = userStatsService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getUserStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userIdStr;
        try {
            userIdStr = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid userId in token");
        }
        int totalPoints = userStatsService.getTotalPoints(userId);
        var topicPoints = userStatsService.getTopicPoints(userId);
        int modulesCompleted = userStatsService.getCompletedModules(userId);
        int modulesInProgress = userStatsService.getInProgressModules(userId);
        return ResponseEntity.ok(Map.of(
            "totalPoints", totalPoints,
            "topicPoints", topicPoints,
            "modulesCompleted", modulesCompleted,
            "modulesInProgress", modulesInProgress
        ));
    }
}
