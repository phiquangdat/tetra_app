package com.tetra.app.repository;

import com.tetra.app.model.UnitContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UnitContentRepository extends JpaRepository<UnitContent, UUID> {
    List<UnitContent> findByUnit_Id(UUID unitId);
    List<UnitContent> findByContentTypeIgnoreCase(String contentType);
}
