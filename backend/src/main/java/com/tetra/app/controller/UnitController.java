package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitRepository unitRepository;
    private final TrainingModuleRepository trainingModuleRepository;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final UnitContentRepository unitContentRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public UnitController(
        UnitRepository unitRepository,
        TrainingModuleRepository trainingModuleRepository,
        JwtUtil jwtUtil,
        BlacklistedTokenRepository blacklistedTokenRepository,
        UnitContentRepository unitContentRepository,
        QuestionRepository questionRepository,
        AnswerRepository answerRepository
    ) {
        this.unitRepository = unitRepository;
        this.trainingModuleRepository = trainingModuleRepository;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.unitContentRepository = unitContentRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    @GetMapping
    public ResponseEntity<?> getUnitsByModuleId(@RequestParam(required = false) UUID moduleId) {
        if (moduleId == null) {
            List<Unit> units = unitRepository.findAll();
            return ResponseEntity.ok(units);
        }
        List<Unit> units = unitRepository.findByModule_Id(moduleId);
        List<Map<String, Object>> result = units.stream()
            .map(unit -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", unit.getId());
                map.put("title", unit.getTitle());
                return map;
            })
            .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable String id) {
        return unitRepository.findById(UUID.fromString(id))
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unit is not found with id: " + id));
    }

    @PostMapping
    public ResponseEntity<?> createUnit(@RequestBody Map<String, Object> body) {
        Object moduleIdObj = body.get("module_id");
        Object titleObj = body.get("title");
        Object descriptionObj = body.get("description");

        if (moduleIdObj == null || titleObj == null || descriptionObj == null) {
            return ResponseEntity.badRequest().body("module_id, title, and description are required");
        }

        UUID moduleId;
        try {
            moduleId = UUID.fromString(moduleIdObj.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid module_id format");
        }

        TrainingModule module = trainingModuleRepository.findById(moduleId).orElse(null);
        if (module == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Module not found with id: " + moduleId);
        }

        String title = titleObj.toString();
        String description = descriptionObj.toString();

        Unit unit = new Unit(module, title, description);
        Unit saved = unitRepository.save(unit);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Unit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unit not found with id: " + id));

        String title = body.get("title") != null ? body.get("title").toString() : null;
        String description = body.get("description") != null ? body.get("description").toString() : null;

        if (title != null) unit.setTitle(title);
        if (description != null) unit.setDescription(description);

        Unit updatedUnit = unitRepository.save(unit);

        return ResponseEntity.ok(updatedUnit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUnit(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        if (!unitRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found with id: " + id);
        }

        List<com.tetra.app.model.UnitContent> contents = unitContentRepository.findByUnit_Id(id);
        for (com.tetra.app.model.UnitContent content : contents) {
            if ("quiz".equalsIgnoreCase(content.getContentType())) {
                List<com.tetra.app.model.Question> questions = questionRepository.findByUnitContent_Id(content.getId());
                for (com.tetra.app.model.Question q : questions) {
                    answerRepository.deleteAll(answerRepository.findByQuestion_Id(q.getId()));
                }
                questionRepository.deleteAll(questions);
            }
            unitContentRepository.deleteById(content.getId());
        }

        unitRepository.deleteById(id);
        return ResponseEntity.ok("Unit deleted");
    }

}