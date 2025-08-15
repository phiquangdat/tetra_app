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
                subjectOpt = subjectRepository.findByUserIdAndSubjectType((Long) entityId, subjectType);
                break;
            case "unit_content":
                subjectOpt = subjectRepository.findByUnitContentIdAndSubjectType((Long) entityId, subjectType);
                break;
            case "unit":
                subjectOpt = subjectRepository.findByUnitIdAndSubjectType((Long) entityId, subjectType);
                break;
            case "training_module":
                subjectOpt = subjectRepository.findByModuleIdAndSubjectType((UUID) entityId, subjectType);
                break;
            default:
                throw new IllegalArgumentException("Unknown subjectType: " + subjectType);
        }
        if (subjectOpt.isPresent()) {
            return subjectOpt.get();
        }
        Subject subject = new Subject();
        subject.setSubjectType(subjectType);
        switch (subjectType) {
            case "user":
                subject.setUserId((Long) entityId);
                break;
            case "unit_content":
                subject.setUnitContentId((Long) entityId);
                break;
            case "unit":
                subject.setUnitId((Long) entityId);
                break;
            case "training_module":
                subject.setModuleId((UUID) entityId);
                break;
        }
        System.out.println("[AdminActionLogService] getOrCreateSubject: subjectType=" + subjectType + ", entityId=" + entityId + ", created=" + (subjectOpt.isEmpty()));
        return subjectRepository.save(subject);
    }

    public void logAction(UUID adminId, String actionType, UUID entityId, String subjectType) {
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

    private Long getUserIdByUuid(UUID uuid) {
        try {
            return userRepository.findById(uuid)
                .map(u -> {
                    // u.getId() должен быть Long, если есть поле Long id
                    // Если id типа UUID, то возвращайте null
                    Object id = u.getId();
                    return (id instanceof Long) ? (Long) id : null;
                })
                .orElse(null);
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getUserIdByUuid exception: " + e.getMessage());
            return null;
        }
    }
    private Long getUnitContentIdByUuid(UUID uuid) {
        try {
            return unitContentRepository.findById(uuid)
                .map(uc -> {
                    Object id = uc.getId();
                    return (id instanceof Long) ? (Long) id : null;
                })
                .orElse(null);
        } catch (Exception e) {
            System.err.println("[AdminActionLogService] getUnitContentIdByUuid exception: " + e.getMessage());
            return null;
        }
    }
    private Long getUnitIdByUuid(UUID uuid) {
        try {
            return unitRepository.findById(uuid)
                .map(u -> {
                    Object id = u.getId();
                    return (id instanceof Long) ? (Long) id : null;
                })
                .orElse(null);
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