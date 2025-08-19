package com.tetra.app.service;

import com.tetra.app.model.AdminActionLog;
import com.tetra.app.model.Subject;
import com.tetra.app.repository.AdminActionLogRepository;
import com.tetra.app.repository.SubjectRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdminActionLogService {

    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private AdminActionLogRepository adminActionLogRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UnitContentRepository unitContentRepository;
    @Autowired
    private UnitRepository unitRepository;
    @Autowired
    private TrainingModuleRepository trainingModuleRepository;

    public Subject getOrCreateSubject(String subjectType, Object entityId) {
        Optional<Subject> subjectOpt = Optional.empty();
        switch (subjectType) {
            case "user":
                subjectOpt = subjectRepository.findByUserId((UUID) entityId);
                break;
            case "unit_content":
                subjectOpt = subjectRepository.findByUnitContentId((UUID) entityId);
                break;
            case "unit":
                subjectOpt = subjectRepository.findByUnitId((UUID) entityId);
                break;
            case "training_module":
                subjectOpt = subjectRepository.findByModuleId((UUID) entityId);
                break;
            default:
                throw new IllegalArgumentException("Unknown subjectType: " + subjectType);
        }
        if (subjectOpt.isPresent()) {
            return subjectOpt.get();
        }
        Subject subject = new Subject();
        switch (subjectType) {
            case "user":
                subject.setUserId((UUID) entityId);
                break;
            case "unit_content":
                subject.setUnitContentId((UUID) entityId);
                break;
            case "unit":
                subject.setUnitId((UUID) entityId);
                break;
            case "training_module":
                subject.setModuleId((UUID) entityId);
                break;
        }
        System.out.println("[AdminActionLogService] getOrCreateSubject: subjectType=" + subjectType + ", entityId=" + entityId + ", created=" + (subjectOpt.isEmpty()));
        return subjectRepository.save(subject);
    }


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(UUID adminId, String actionType, UUID entityId, String subjectType) {
        // Fallback: if adminId is null, use AuthController.lastAdminId
        if (adminId == null) {
            try {
                adminId = com.tetra.app.controller.AuthController.lastAdminId;
                System.out.println("[AdminActionLogService] Fallback to AuthController.lastAdminId: " + adminId);
            } catch (Exception e) {
                System.err.println("[AdminActionLogService] Could not get lastAdminId from AuthController: " + e.getMessage());
            }
        }
        // Special case: if creating user/unit_content/unit/training_module and entityId is null, try to get last created entity
        if ("create".equals(actionType) && entityId == null) {
            try {
                switch (subjectType) {
                    case "user": {
                        Optional<com.tetra.app.model.User> lastUser = userRepository.findAll().stream()
                            .sorted((u1, u2) -> u2.getId().compareTo(u1.getId()))
                            .findFirst();
                        if (lastUser.isPresent()) {
                            entityId = lastUser.get().getId();
                            System.out.println("[AdminActionLogService] Fallback: using last created userId for log: " + entityId);
                        }
                        break;
                    }
                    case "unit_content": {
                        Optional<com.tetra.app.model.UnitContent> lastContent = unitContentRepository.findAll().stream()
                            .sorted((c1, c2) -> c2.getId().compareTo(c1.getId()))
                            .findFirst();
                        if (lastContent.isPresent()) {
                            entityId = lastContent.get().getId();
                            System.out.println("[AdminActionLogService] Fallback: using last created unitContentId for log: " + entityId);
                        }
                        break;
                    }
                    case "unit": {
                        Optional<com.tetra.app.model.Unit> lastUnit = unitRepository.findAll().stream()
                            .sorted((u1, u2) -> u2.getId().compareTo(u1.getId()))
                            .findFirst();
                        if (lastUnit.isPresent()) {
                            entityId = lastUnit.get().getId();
                            System.out.println("[AdminActionLogService] Fallback: using last created unitId for log: " + entityId);
                        }
                        break;
                    }
                    case "training_module": {
                        Optional<com.tetra.app.model.TrainingModule> lastModule = trainingModuleRepository.findAll().stream()
                            .sorted((m1, m2) -> m2.getId().compareTo(m1.getId()))
                            .findFirst();
                        if (lastModule.isPresent()) {
                            entityId = lastModule.get().getId();
                            System.out.println("[AdminActionLogService] Fallback: using last created moduleId for log: " + entityId);
                        }
                        break;
                    }
                }
            } catch (Exception e) {
                System.err.println("[AdminActionLogService] Could not get last created entity for logging: " + e.getMessage());
            }
        }
        System.out.println("[AdminActionLogService] logAction called with adminId=" + adminId +
                ", actionType=" + actionType + ", entityId=" + entityId + ", subjectType=" + subjectType);

        Object entityKey = null;
        boolean entityExists = false;
        try {
            switch (subjectType) {
                case "user":
                    entityKey = getUserIdByUuid(entityId);
                    entityExists = entityKey != null;
                    break;
                case "unit_content":
                    entityKey = getUnitContentIdByUuid(entityId);
                    entityExists = entityKey != null;
                    break;
                case "unit":
                    entityKey = getUnitIdByUuid(entityId);
                    entityExists = entityKey != null;
                    break;
                case "training_module":
                    entityKey = getModuleUuidIfExists(entityId);
                    entityExists = entityKey != null;
                    break;
                default:
                    throw new IllegalArgumentException("Unknown subjectType: " + subjectType);
            }
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] Exception while checking entity existence: " + e.getMessage());
            return;
        }
        if (!entityExists) {
            System.err.println("[AdminActionLogService] Entity with UUID " + entityId + " and type " + subjectType + " does not exist in DB.");
            return;
        }
        try {
            System.out.println("[AdminActionLogService] Preparing to save admin action log...");
            Subject subject = getOrCreateSubject(subjectType, entityKey);
            AdminActionLog log = new AdminActionLog();
            log.setAdminId(adminId);
            log.setActionType(actionType);
            log.setSubjectType(subjectType);
            log.setTimestamp(LocalDateTime.now());
            log.setSubject(subject);
            System.out.println("[AdminActionLogService] Saving AdminActionLog entity: " + log);
            AdminActionLog savedLog = adminActionLogRepository.save(log);
            System.out.println("[AdminActionLogService] Admin action log saved to DB: id=" + savedLog.getId() + ", adminId=" + savedLog.getAdminId() + ", actionType=" + savedLog.getActionType() + ", subjectType=" + savedLog.getSubjectType() + ", timestamp=" + savedLog.getTimestamp());
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] Exception while saving admin action log: " + e.getMessage());
        }
        System.out.println("[AdminActionLogService] logAction completed for adminId=" + adminId + ", actionType=" + actionType + ", entityId=" + entityId + ", subjectType=" + subjectType);
    }

    public boolean moduleExists(UUID moduleId) {
        boolean exists = trainingModuleRepository.existsById(moduleId);
        System.out.println("[AdminActionLogService] moduleExists: " + moduleId + " -> " + exists);
        return exists;
    }

    private UUID getUserIdByUuid(UUID uuid) {
        try {
            return userRepository.findById(uuid)
                .map(u -> {
                    Object id = u.getId();
                    if (id instanceof UUID) return (UUID) id;
                    return null;
                })
                .orElse(null);
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getUserIdByUuid exception: " + e.getMessage());
            return null;
        }
    }
    private UUID getUnitContentIdByUuid(UUID uuid) {
        try {
            return unitContentRepository.findById(uuid)
                .map(uc -> {
                    Object id = uc.getId();
                    if (id instanceof UUID) return (UUID) id;
                    return null;
                })
                .orElse(null);
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getUnitContentIdByUuid exception: " + e.getMessage());
            return null;
        }
    }
    private UUID getUnitIdByUuid(UUID uuid) {
        try {
            return unitRepository.findById(uuid)
                .map(u -> {
                    Object id = u.getId();
                    if (id instanceof UUID) return (UUID) id;
                    return null;
                })
                .orElseGet(() -> {
                    // Debug: print all units in DB if not found
                    System.err.println("[AdminActionLogService] Unit not found for UUID " + uuid + ". All units in DB:");
                    unitRepository.findAll().forEach(unit -> System.err.println("  Unit: " + unit.getId()));
                    return null;
                });
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getUnitIdByUuid exception: " + e.getMessage());
            return null;
        }
    }
    private UUID getModuleUuidIfExists(UUID uuid) {
        try {
            return trainingModuleRepository.findById(uuid)
                .map(m -> m.getId())
                .orElse(null);
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getModuleUuidIfExists exception: " + e.getMessage());
            return null;
        }
    }
}