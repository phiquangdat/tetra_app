package com.tetra.app.controller;

import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.ProgressStatus;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UserModuleProgressRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.tetra.app.dto.PatchUserModuleProgressRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.annotation.processing.Generated;

@RestController
@RequestMapping("/api/user-module-progress")
public class UserModuleProgressController {

    private final UserModuleProgressRepository userModuleProgressRepository;
    private final TrainingModuleRepository trainingModuleRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UnitRepository unitRepository;
    private final UnitContentRepository unitContentRepository;

    public UserModuleProgressController(
            UserModuleProgressRepository userModuleProgressRepository,
            TrainingModuleRepository trainingModuleRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            UnitRepository unitRepository,
            UnitContentRepository unitContentRepository
    ) {
        this.userModuleProgressRepository = userModuleProgressRepository;
        this.trainingModuleRepository = trainingModuleRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.unitRepository = unitRepository;
        this.unitContentRepository = unitContentRepository;
    }

    @PostMapping
    public ResponseEntity<?> createUserModuleProgress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body
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

        String moduleIdStr = body.get("moduleId");
        if (moduleIdStr == null) {
            return ResponseEntity.badRequest().body("moduleId is required");
        }
        UUID moduleId;
        try {
            moduleId = UUID.fromString(moduleIdStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid moduleId format");
        }

        if (userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Progress already exists for this user and module");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        Optional<TrainingModule> moduleOpt = trainingModuleRepository.findById(moduleId);
        if (moduleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Module not found");
        }

        Unit lastVisitedUnit = null;
        String lastVisitedUnitIdStr = body.get("lastVisitedUnitId");
        if (lastVisitedUnitIdStr != null) {
            try {
                UUID lastVisitedUnitId = UUID.fromString(lastVisitedUnitIdStr);
                lastVisitedUnit = unitRepository.findById(lastVisitedUnitId).orElse(null);
                if (lastVisitedUnit == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lastVisitedUnit not found");
                }
            } catch (Exception ignored) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid lastVisitedUnitId format");
            }
        }
        if (lastVisitedUnit == null) {
            var units = unitRepository.findByModule_Id(moduleId).stream()
                    .sorted((u1, u2) -> u1.getId().compareTo(u2.getId()))
                    .toList();
            for (Unit u : units) {
                var contents = unitContentRepository.findByUnit_Id(u.getId());
                if (!contents.isEmpty()) {
                    lastVisitedUnit = u;
                    break;
                }
            }
            if (lastVisitedUnit == null && !units.isEmpty()) {
                lastVisitedUnit = units.get(0);
            }
        }
        if (lastVisitedUnit == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Module has no units");
        }

        UnitContent lastVisitedContent = null;
        String lastVisitedContentIdStr = body.get("lastVisitedContent");
        if (lastVisitedContentIdStr != null) {
            try {
                UUID lastVisitedContentId = UUID.fromString(lastVisitedContentIdStr);
                lastVisitedContent = unitContentRepository.findById(lastVisitedContentId).orElse(null);
                if (lastVisitedContent == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lastVisitedContent not found");
                }
                if (lastVisitedContent.getUnit() == null ||
                    !lastVisitedContent.getUnit().getId().equals(lastVisitedUnit.getId())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("lastVisitedContent does not belong to the specified unit");
                }
                if (lastVisitedContent.getUnit().getModule() == null ||
                    !lastVisitedContent.getUnit().getModule().getId().equals(moduleId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("lastVisitedContent does not belong to the specified module");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid lastVisitedContent format");
            }
        }
        if (lastVisitedContent == null) {
            var contents = unitContentRepository.findByUnit_Id(lastVisitedUnit.getId());
            if (contents.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No content found for unit " + lastVisitedUnit.getId());
            }
            lastVisitedContent = contents.stream()
                    .sorted((c1, c2) -> {
                        Integer so1 = c1.getSortOrder() != null ? c1.getSortOrder() : 0;
                        Integer so2 = c2.getSortOrder() != null ? c2.getSortOrder() : 0;
                        int cmp = so1.compareTo(so2);
                        return cmp != 0 ? cmp : c1.getId().compareTo(c2.getId());
                    })
                    .findFirst()
                    .orElse(null);
        }
        if (lastVisitedContent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Last visited unit (" + lastVisitedUnit.getId() + ") has no content after sorting.");
        }

        UserModuleProgress progress = new UserModuleProgress();
        progress.setUser(userOpt.get());
        progress.setModule(moduleOpt.get());
        progress.setStatus(ProgressStatus.IN_PROGRESS);
        progress.setEarnedPoints(0);
        progress.setLastVisitedUnit(lastVisitedUnit);
        progress.setLastVisitedContent(lastVisitedContent);

        try {
            UserModuleProgress saved = userModuleProgressRepository.save(progress);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database error: " + e.getMessage());
        }
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<?> getCurrentUserModuleProgressByModuleId(
            @PathVariable UUID moduleId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
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

        var progressOpt = userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId);
        if (progressOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User module progress not found");
        }
        UserModuleProgress progress = progressOpt.get();
        var response = Map.of(
            "status", progress.getStatus(),
            "last_visited_unit_id", progress.getLastVisitedUnit() != null ? progress.getLastVisitedUnit().getId() : null,
            "last_visited_content_id", progress.getLastVisitedContent() != null ? progress.getLastVisitedContent().getId() : null,
            "earned_points", progress.getEarnedPoints()
        );
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patchUserModuleProgress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") UUID progressId,
            @RequestBody PatchUserModuleProgressRequest updates
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

        UserModuleProgress progress = userModuleProgressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));

        if (!progress.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        if (updates.getLastVisitedUnitId() != null) {
            Unit unit = unitRepository.findById(updates.getLastVisitedUnitId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid unit ID"));
            if (!unit.getModule().getId().equals(progress.getModule().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unit does not belong to module");
            }
            progress.setLastVisitedUnit(unit);
        }

        if (updates.getLastVisitedContentId() != null) {
            UnitContent content = unitContentRepository.findById(updates.getLastVisitedContentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid content ID"));
            if (!content.getUnit().getModule().getId().equals(progress.getModule().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Content does not belong to module");
            }
            progress.setLastVisitedContent(content);
        }

        if (updates.getStatus() != null) {
            try {
                progress.setStatus(ProgressStatus.valueOf(updates.getStatus()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status value");
            }
        }

        if (updates.getEarnedPoints() != null) {
            progress.setEarnedPoints(updates.getEarnedPoints());
        }

        try {
            UserModuleProgress saved = userModuleProgressRepository.save(progress);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update progress: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserModuleProgress(
            @PathVariable("id") UUID progressId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userIdStr;
        String role;
        try {
            userIdStr = jwtUtil.extractUserId(token);
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid userId in token");
        }

        Optional<UserModuleProgress> progressOpt = userModuleProgressRepository.findById(progressId);
        if (progressOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User module progress not found");
        }
        UserModuleProgress progress = progressOpt.get();

        // Only the owner or ADMIN can delete
        if (!"ADMIN".equals(role) && !progress.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        userModuleProgressRepository.deleteById(progressId);
        return ResponseEntity.ok("User module progress deleted");
    }

    @GetMapping("")
    public ResponseEntity<?> getUserModuleProgressList(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "status", required = false) String statusStr,
            @RequestParam(value = "limit", required = false) Integer limit
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

        ProgressStatus status = null;
        if (statusStr != null) {
            try {
                status = ProgressStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status value");
            }
        }

        List<UserModuleProgress> progresses;
        if (status != null) {
            progresses = userModuleProgressRepository.findByUser_IdAndStatus(userId, status);
        } else {
            progresses = userModuleProgressRepository.findByUser_Id(userId);
        }
        if (limit != null && limit > 0 && progresses.size() > limit) {
            progresses = progresses.subList(0, limit);
        }

        var result = progresses.stream().map(progress -> {
            var module = progress.getModule();
            return Map.of(
                "moduleId", module != null ? module.getId() : null,
                "moduleTitle", module != null ? module.getTitle() : null,
                "status", progress.getStatus(),
                "earned_points", progress.getEarnedPoints(),
                "last_visited_unit_id", progress.getLastVisitedUnit() != null ? progress.getLastVisitedUnit().getId() : null,
                "last_visited_content_id", progress.getLastVisitedContent() != null ? progress.getLastVisitedContent().getId() : null
            );
        }).toList();

        return ResponseEntity.ok(result);
    }
}
