package com.tetra.app.repository;

import com.tetra.app.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByUserIdAndSubjectType(Long userId, String subjectType);
    Optional<Subject> findByUnitContentIdAndSubjectType(Long unitContentId, String subjectType);
    Optional<Subject> findByUnitIdAndSubjectType(Long unitId, String subjectType);
    Optional<Subject> findByModuleIdAndSubjectType(UUID moduleId, String subjectType);
}
