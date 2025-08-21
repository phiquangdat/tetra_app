package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.Question;
import com.tetra.app.model.Answer;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.repository.UserModuleProgressRepository;
import com.tetra.app.repository.UserUnitProgressRepository;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.model.UserContentProgress;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
public class TrainingModuleController {

    private final TrainingModuleRepository trainingModuleRepository;
    private final UnitRepository unitRepository;
    private final UnitContentRepository unitContentRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final JwtUtil jwtUtil;
    private final UserModuleProgressRepository userModuleProgressRepository;
    private final UserUnitProgressRepository userUnitProgressRepository;
    private final UserContentProgressRepository userContentProgressRepository;

    public TrainingModuleController(
        TrainingModuleRepository trainingModuleRepository,
        UnitRepository unitRepository,
        UnitContentRepository unitContentRepository,
        QuestionRepository questionRepository,
        AnswerRepository answerRepository,
        JwtUtil jwtUtil,
        UserModuleProgressRepository userModuleProgressRepository,
        UserUnitProgressRepository userUnitProgressRepository,
        UserContentProgressRepository userContentProgressRepository
    ) {
        this.trainingModuleRepository = trainingModuleRepository;
        this.unitRepository = unitRepository;
        this.unitContentRepository = unitContentRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.jwtUtil = jwtUtil;
        this.userModuleProgressRepository = userModuleProgressRepository;
        this.userUnitProgressRepository = userUnitProgressRepository;
        this.userContentProgressRepository = userContentProgressRepository;
    }

    @GetMapping
    public List<TrainingModule> getAllModules() {
        return trainingModuleRepository.findAll();
    }

    @GetMapping("/{id}")
    public TrainingModule getModuleById(@PathVariable UUID id) {
        return trainingModuleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + id));
    }

    @PostMapping
    public ResponseEntity<?> createModule(@RequestBody TrainingModule module) {
        if (module.getTitle() == null || module.getTitle().isEmpty()) {
            return new ResponseEntity<>("Title is required", HttpStatus.BAD_REQUEST);
        }
        if (module.getTopic() == null || module.getTopic().isEmpty()) {
            return new ResponseEntity<>("Topic is required", HttpStatus.BAD_REQUEST);
        }
        if (module.getDescription() == null || module.getDescription().isEmpty()) {
            return new ResponseEntity<>("Description is required", HttpStatus.BAD_REQUEST);
        }
        String coverUrl = module.getCoverurl();
        if (coverUrl == null || coverUrl.isEmpty()) {
            return new ResponseEntity<>("coverUrl is required", HttpStatus.BAD_REQUEST);
        }
        if (module.getPoints() == null) {
            module.setPoints(0);
        }
        if (module.getStatus() == null || module.getStatus().isEmpty()) {
            module.setStatus("draft");
        }
        if (!module.getStatus().equals("draft") && !module.getStatus().equals("published")) {
            return new ResponseEntity<>("Invalid status value. Allowed: draft, published", HttpStatus.BAD_REQUEST);
        }

        try {
            TrainingModule savedModule = trainingModuleRepository.save(module);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", savedModule.getId());
            response.put("title", savedModule.getTitle());
            response.put("points", savedModule.getPoints());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create module: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateModule(@PathVariable UUID id, @RequestBody com.tetra.app.dto.UpdateTrainingModuleRequest updated) {
        var existingOpt = trainingModuleRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return new ResponseEntity<>("Module not found with id: " + id, HttpStatus.NOT_FOUND);
        }
        TrainingModule existing = existingOpt.get();

        if (updated.getTitle() != null) {
            existing.setTitle(updated.getTitle());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }
        if (updated.getTopic() != null) {
            existing.setTopic(updated.getTopic());
        }
        if (updated.getPoints() != null) {
            existing.setPoints(updated.getPoints());
        }
        if (updated.getCoverUrl() != null) {
            existing.setCoverurl(updated.getCoverUrl());
        }
        if (updated.getStatus() != null) {
            if (!updated.getStatus().equals("draft") && !updated.getStatus().equals("published")) {
                return new ResponseEntity<>("Invalid status value. Allowed: draft, published", HttpStatus.BAD_REQUEST);
            }
            existing.setStatus(updated.getStatus());
        }

        TrainingModule saved = trainingModuleRepository.save(existing);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteModule(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader
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
        if (!trainingModuleRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Module not found with id: " + id);
        }

        try {
            // Delete user progress for this module
            List<UserModuleProgress> moduleProgresses = userModuleProgressRepository.findByModule_Id(id);
            userModuleProgressRepository.deleteAll(moduleProgresses);

            List<Unit> units = unitRepository.findByModule_Id(id);
            for (Unit unit : units) {
                // Delete user unit progress for this unit
                List<UserUnitProgress> unitProgresses = userUnitProgressRepository.findByUnit_Id(unit.getId());
                userUnitProgressRepository.deleteAll(unitProgresses);

                List<UnitContent> contents = unitContentRepository.findByUnit_Id(unit.getId());
                for (UnitContent content : contents) {
                    // Delete user content progress for this content
                    List<UserContentProgress> contentProgresses = userContentProgressRepository.findByUnitContent_Id(content.getId());
                    userContentProgressRepository.deleteAll(contentProgresses);

                    if ("quiz".equalsIgnoreCase(content.getContentType())) {
                        List<Question> questions = questionRepository.findByUnitContent_Id(content.getId());
                        for (Question q : questions) {
                            answerRepository.deleteAll(answerRepository.findByQuestion_Id(q.getId()));
                        }
                        questionRepository.deleteAll(questions);
                    }
                    unitContentRepository.deleteById(content.getId());
                }
                unitRepository.deleteById(unit.getId());
            }

            trainingModuleRepository.deleteById(id);
            return ResponseEntity.ok("Module deleted successfully");
        } catch (Exception e) {
            
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to delete module and all related content: " + e.getMessage());
        }
    }
}


