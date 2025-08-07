package com.tetra.app.controller;

import com.tetra.app.mapper.UserContentProgressMapper;
import com.tetra.app.mapper.UserContentProgressPointsMapper;
import com.tetra.app.model.UserContentProgress;
import com.tetra.app.model.User;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/users-content-progress")
public class UserContentProgressController {

    private final UserContentProgressRepository userContentProgressRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final UnitContentRepository unitContentRepository;
    private final JwtUtil jwtUtil;

    public UserContentProgressController(
        UserContentProgressRepository userContentProgressRepository,
        UserRepository userRepository,
        UnitRepository unitRepository,
        UnitContentRepository unitContentRepository,
        JwtUtil jwtUtil
    ) {
        this.userContentProgressRepository = userContentProgressRepository;
        this.userRepository = userRepository;
        this.unitRepository = unitRepository;
        this.unitContentRepository = unitContentRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> createUserContentProgress(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, Object> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userIdStr;
        try {
            userIdStr = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId in token");
        }

        Object unitIdObj = body.get("unitId");
        Object unitContentIdObj = body.get("unitContentId");
        Object statusObj = body.get("status");
        Object pointsObj = body.get("points");

        if (unitIdObj == null || unitContentIdObj == null || statusObj == null || pointsObj == null) {
            return ResponseEntity.badRequest().body("unitId, unitContentId, status, and points are required");
        }

        UUID unitId, unitContentId;
        String status;
        Integer points;
        try {
            unitId = UUID.fromString(unitIdObj.toString());
            unitContentId = UUID.fromString(unitContentIdObj.toString());
            status = statusObj.toString();
            points = (pointsObj instanceof Integer) ? (Integer) pointsObj : Integer.parseInt(pointsObj.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid unitId, unitContentId, or points format");
        }

        if (!("IN_PROGRESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status))) {
            return ResponseEntity.badRequest().body("Invalid status value. Allowed: IN_PROGRESS, COMPLETED");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        Optional<Unit> unitOpt = unitRepository.findById(unitId);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
        }
        Optional<UnitContent> unitContentOpt = unitContentRepository.findById(unitContentId);
        if (unitContentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("UnitContent not found");
        }

        UnitContent unitContent = unitContentOpt.get();
        if (unitContent.getUnit() == null || !unitContent.getUnit().getId().equals(unitId)) {
            return ResponseEntity.badRequest().body("UnitContent does not belong to the specified Unit");
        }

        if (userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Progress already exists for this user and content");
        }

        UserContentProgress progress = new UserContentProgress();
        progress.setUser(userOpt.get());
        progress.setUnit(unitOpt.get());
        progress.setUnitContent(unitContentOpt.get());
        progress.setStatus(status);
        progress.setPoints(points);

        UserContentProgress saved = userContentProgressRepository.save(progress);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @GetMapping("")
    public ResponseEntity<?> getUserContentProgressByUnitId(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(value = "unitId", required = false) String unitIdStr
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userIdStr;
        try {
            userIdStr = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        UUID userId;
        UUID unitId;
        try {
            userId = UUID.fromString(userIdStr);
            unitId = UUID.fromString(unitIdStr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId or unitId format");
        }

        List<UserContentProgress> progressList = userContentProgressRepository.findByUser_IdAndUnit_Id(userId, unitId);
        if (progressList == null || progressList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No progress found for this unit");
        }

        List<Object> result = progressList.stream()
            .map(UserContentProgressMapper::toDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserContentProgress(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, Object> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userIdStr;
        try {
            userIdStr = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId in token");
        }

        Optional<UserContentProgress> progressOpt = userContentProgressRepository.findById(id);
        if (progressOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Progress not found");
        }
        UserContentProgress progress = progressOpt.get();
        if (!progress.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Progress not found for this user");
        }

        boolean updated = false;
        if (body.containsKey("status")) {
            String status = body.get("status").toString();
            if (!("IN_PROGRESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status))) {
                return ResponseEntity.badRequest().body("Invalid status value. Allowed: IN_PROGRESS, COMPLETED");
            }
            progress.setStatus(status);
            updated = true;
        }
        if (body.containsKey("points")) {
            try {
                Integer points = (body.get("points") instanceof Integer)
                    ? (Integer) body.get("points")
                    : Integer.parseInt(body.get("points").toString());
                progress.setPoints(points);
                updated = true;
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Invalid points format");
            }
        }
        if (!updated) {
            return ResponseEntity.badRequest().body("No updatable fields provided");
        }

        UserContentProgress saved = userContentProgressRepository.save(progress);
        return ResponseEntity.ok(saved);
    }

    private int getPoints(UserContentProgress userContentProgress) {
        return UserContentProgressPointsMapper.getAvailablePoints(userContentProgress);
    }
}
