package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.TrainingModuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
public class TrainingModuleController {

    private final TrainingModuleRepository trainingModuleRepository;

    public TrainingModuleController(TrainingModuleRepository trainingModuleRepository) {
        this.trainingModuleRepository = trainingModuleRepository;
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
            return new ResponseEntity<>("Points is required", HttpStatus.BAD_REQUEST);
        }

        // Set default status if not provided
        if (module.getStatus() == null || module.getStatus().isEmpty()) {
            module.setStatus("draft"); // Only "draft" or "published" are allowed
        }
        // Optionally validate status if provided
        if (!module.getStatus().equals("draft") && !module.getStatus().equals("published")) {
            return new ResponseEntity<>("Invalid status value. Allowed: draft, published", HttpStatus.BAD_REQUEST);
        }

        try {
            TrainingModule savedModule = trainingModuleRepository.save(module);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", savedModule.getId());
            response.put("title", savedModule.getTitle());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create module: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


