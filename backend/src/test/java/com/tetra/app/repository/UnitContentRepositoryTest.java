package com.tetra.app.repository;

import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

@ExtendWith(SpringExtension.class)
@DataJpaTest
class UnitContentRepositoryTest {

    @Autowired
    private UnitContentRepository unitContentRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Test
    void testSaveAndFindUnitContent() {
        Unit unit = new Unit();
        unitRepository.save(unit);

        UnitContent unitContent = new UnitContent(unit, 1, "text", "Sample Title", "Sample Content", "https://example.com");
        UnitContent savedUnitContent = unitContentRepository.save(unitContent);

        assertNotNull(savedUnitContent.getId());

        UnitContent retrievedContent = unitContentRepository.findById(savedUnitContent.getId()).orElse(null);
        assertNotNull(retrievedContent);
        assertEquals("Sample Title", retrievedContent.getTitle());
        assertEquals("Sample Content", retrievedContent.getContentData());
        assertEquals("https://example.com", retrievedContent.getUrl());
        assertEquals(1, retrievedContent.getSortOrder());
        assertEquals(unit.getId(), retrievedContent.getUnitId());
    }

    @Test
    void testDeleteUnitContent() {
        Unit unit = new Unit();
        unitRepository.save(unit);

        UnitContent unitContent = new UnitContent(unit, 2, "video", "Video Title", "Video Content", "https://video.com");
        UnitContent savedUnitContent = unitContentRepository.save(unitContent);

        unitContentRepository.delete(savedUnitContent);
        assertFalse(unitContentRepository.findById(savedUnitContent.getId()).isPresent());
    }
}
