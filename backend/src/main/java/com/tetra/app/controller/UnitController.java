package com.tetra.app.controller;

import com.tetra.app.model.Unit;
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

    public UnitController(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public ResponseEntity<?> getUnitsByModuleId(@RequestParam(required = false) UUID moduleId) {
        if (moduleId == null) {
            return ResponseEntity.badRequest().body("moduleId query parameter is required");
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

}