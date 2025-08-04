package com.tetra.app.controller;

import com.tetra.app.dto.UserUnitProgressDto;
import com.tetra.app.mapper.UserUnitProgressMapper;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.UserUnitProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-unit-progress")
public class UserUnitProgressController {

    private final UserUnitProgressRepository userUnitProgressRepository;
    private final UserRepository userRepository;
    private final TrainingModuleRepository trainingModuleRepository;
    private final UnitRepository unitRepository;
    private final JwtUtil jwtUtil;

    public UserUnitProgressController(
            UserUnitProgressRepository userUnitProgressRepository,
            UserRepository userRepository,
            TrainingModuleRepository trainingModuleRepository,
            UnitRepository unitRepository,
            JwtUtil jwtUtil
    ) {
        this.userUnitProgressRepository = userUnitProgressRepository;
        this.userRepository = userRepository;
        this.trainingModuleRepository = trainingModuleRepository;
        this.unitRepository = unitRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("")
    public ResponseEntity<?> createUserUnitProgressWithAuth(
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
        String unitIdStr = body.get("unitId");
        String status = body.get("status");
        if (moduleIdStr == null || unitIdStr == null || status == null) {
            return ResponseEntity.badRequest().body("moduleId, unitId, and status are required");
        }
        UUID moduleId, unitId;
        try {
            moduleId = UUID.fromString(moduleIdStr);
            unitId = UUID.fromString(unitIdStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid moduleId or unitId format");
        }

        Optional<UserUnitProgress> existing = userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Progress already exists for this user and unit");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        Optional<TrainingModule> moduleOpt = trainingModuleRepository.findById(moduleId);
        if (moduleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Module not found");
        }
        Optional<Unit> unitOpt = unitRepository.findById(unitId);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
        }

        Unit unit = unitOpt.get();
        if (unit.getModule() == null || !unit.getModule().getId().equals(moduleId)) {
            return ResponseEntity.badRequest().body("Unit does not belong to the specified module");
        }

        UserUnitProgress entity = new UserUnitProgress();
        entity.setUser(userOpt.get());
        entity.setModule(moduleOpt.get());
        entity.setUnit(unit);
        entity.setStatus(status);

        UserUnitProgress saved = userUnitProgressRepository.save(entity);
        UserUnitProgressDto responseDto = UserUnitProgressMapper.toDto(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }
}