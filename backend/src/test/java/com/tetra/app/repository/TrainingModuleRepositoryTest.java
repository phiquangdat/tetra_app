package com.tetra.app.repository;

import com.tetra.app.model.TrainingModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TrainingModuleRepositoryTest {

    @Autowired
    private TrainingModuleRepository repository;

    @Test
    void testSaveAndFind() {
        TrainingModule module = new TrainingModule();
        module.setTitle("Test");
        module.setDescription("Desc");
        module.setPoints(10);
        module.setTopic("Topic");
        module.setCoverurl("cover.jpg");

        TrainingModule saved = repository.save(module);
        assertThat(saved.getId()).isNotNull();

        TrainingModule found = repository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("Test");
    }
}
