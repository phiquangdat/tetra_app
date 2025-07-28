package com.tetra.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tetra.app.model.ProgressStatus;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UserModuleProgressRepository;

@Service
public class UserModuleProgressService {

    private final UserModuleProgressRepository repository;
    private final UnitContentRepository unitContentRepository;
    private final UnitRepository unitRepository;
    private final TrainingModuleRepository trainingModuleRepository;

    public UserModuleProgressService(
        UserModuleProgressRepository repository,
        UnitContentRepository unitContentRepository,
        UnitRepository unitRepository,
        TrainingModuleRepository trainingModuleRepository
    ) {
        this.repository = repository;
        this.unitContentRepository = unitContentRepository;
        this.unitRepository = unitRepository;
        this.trainingModuleRepository = trainingModuleRepository;
    }

    public UserModuleProgressService() {
        this.repository = null;
        this.unitContentRepository = null;
        this.unitRepository = null;
        this.trainingModuleRepository = null;
    }

    public UserModuleProgressService(UserModuleProgressRepository repository) {
        this.repository = repository;
        this.unitContentRepository = null;
        this.unitRepository = null;
        this.trainingModuleRepository = null;
    }

    public List<UserModuleProgress> findAll() {
        return repository.findAll();
    }

    public Optional<UserModuleProgress> findById(UUID id) {
        return repository.findById(id);
    }

    public UserModuleProgress save(UserModuleProgress progress) {
        return repository.save(progress);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    public UserModuleProgress updateStatus(UUID id, ProgressStatus status) {
        UserModuleProgress progress = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));
        progress.setStatus(status);
        return repository.save(progress);
    }

    public Optional<UserModuleProgress> findByUserIdAndModuleId(UUID userId, UUID moduleId) {
        return repository.findByUser_IdAndModule_Id(userId, moduleId);
    }

    public List<UserModuleProgress> findByUserId(UUID userId) {
        return repository.findByUser_Id(userId);
    }

    public List<UserModuleProgress> findByModuleId(UUID moduleId) {
        return repository.findByModule_Id(moduleId);
    }

    public boolean isContentBelongsToModuleAndUnit(UUID moduleId, UUID unitId, UUID contentId) {
        if (moduleId == null || unitId == null || contentId == null) return false;
        UnitContent content = unitContentRepository.findById(contentId).orElse(null);
        if (content == null) return false;
        Unit unit = content.getUnit();
        if (unit == null || !unitId.equals(unit.getId())) return false;
        TrainingModule module = unit.getModule();
        return module != null && moduleId.equals(module.getId());
    }
}
