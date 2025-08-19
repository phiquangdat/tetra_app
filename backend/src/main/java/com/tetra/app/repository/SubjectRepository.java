package com.tetra.app.repository;

import com.tetra.app.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByUserId(UUID userId);
    Optional<Subject> findByUnitContentId(UUID unitContentId);
    Optional<Subject> findByUnitId(UUID unitId);
    Optional<Subject> findByModuleId(UUID moduleId);
}
