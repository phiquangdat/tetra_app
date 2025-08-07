package com.tetra.app.repository;

import com.tetra.app.model.TrainingModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.UUID;

@Repository
public interface TrainingModuleRepository extends JpaRepository<TrainingModule, UUID> {

    @Query("SELECT COALESCE(SUM(t.points), 0) FROM TrainingModule t")
    long sumPoints();

    long countByStatus(String status);
}
