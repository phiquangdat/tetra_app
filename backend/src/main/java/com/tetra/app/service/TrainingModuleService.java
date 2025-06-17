package com.tetra.app.service;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.TrainingModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TrainingModuleService {

    private final TrainingModuleRepository trainingModuleRepository;

    @Autowired
    public TrainingModuleService(TrainingModuleRepository trainingModuleRepository) {
        this.trainingModuleRepository = trainingModuleRepository;
    }

    public TrainingModule addTrainingModule(TrainingModule trainingModule) {
        return trainingModuleRepository.save(trainingModule);
    }

    public TrainingModule updateTrainingModule(UUID id, TrainingModule trainingModule) {
        return trainingModuleRepository.findById(id)
                .map(existingModule -> {
                    trainingModule.setId(id);
                    return trainingModuleRepository.save(trainingModule);
                })
                .orElse(null);
    }
}
