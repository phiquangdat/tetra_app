package com.tetra.app.repository;

import com.tetra.app.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByUnitContentId(UUID contentId);
}
