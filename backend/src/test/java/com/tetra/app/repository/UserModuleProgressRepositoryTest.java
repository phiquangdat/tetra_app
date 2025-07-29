package com.tetra.app.repository;

import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.ProgressStatus;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserModuleProgressRepositoryTest {

    @Autowired
    private UserModuleProgressRepository repository;

    @Test
    void testSaveAndFind() {
        User user = new User();
        user.setId(UUID.randomUUID());
        TrainingModule module = new TrainingModule();
        module.setId(UUID.randomUUID());

        UserModuleProgress progress = new UserModuleProgress();
        progress.setUser(user);
        progress.setModule(module);
        progress.setStatus(ProgressStatus.IN_PROGRESS);

        UserModuleProgress saved = repository.save(progress);
        assertThat(saved.getId()).isNotNull();

        UserModuleProgress found = repository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getModule().getId()).isEqualTo(module.getId());
        assertThat(found.getStatus()).isEqualTo(ProgressStatus.IN_PROGRESS);
    }

    @Test
    void testUpdateStatus() {
        User user = new User();
        user.setId(UUID.randomUUID());
        TrainingModule module = new TrainingModule();
        module.setId(UUID.randomUUID());

        UserModuleProgress progress = new UserModuleProgress();
        progress.setUser(user);
        progress.setModule(module);
        progress.setStatus(ProgressStatus.IN_PROGRESS);

        UserModuleProgress saved = repository.save(progress);
        saved.setStatus(ProgressStatus.COMPLETED);
        UserModuleProgress updated = repository.save(saved);

        assertThat(updated.getStatus()).isEqualTo(ProgressStatus.COMPLETED);
    }

    @Test
    void testDelete() {
        User user = new User();
        user.setId(UUID.randomUUID());
        TrainingModule module = new TrainingModule();
        module.setId(UUID.randomUUID());

        UserModuleProgress progress = new UserModuleProgress();
        progress.setUser(user);
        progress.setModule(module);
        progress.setStatus(ProgressStatus.IN_PROGRESS);

        UserModuleProgress saved = repository.save(progress);
        UUID id = saved.getId();
        repository.deleteById(id);

        assertThat(repository.findById(id)).isEmpty();
    }
}
