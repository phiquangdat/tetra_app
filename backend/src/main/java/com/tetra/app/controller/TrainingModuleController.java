package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.TrainingModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
public class TrainingModuleController {

    private final TrainingModuleRepository trainingModuleRepository;

    @Autowired
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
}
