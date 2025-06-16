package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
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

    public UnitController(UnitRepository unitRepository, TrainingModuleRepository trainingModuleRepository) {
        this.unitRepository = unitRepository;
        this.trainingModuleRepository = trainingModuleRepository;
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

}