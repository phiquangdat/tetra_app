package com.tetra.app.repository;

import com.tetra.app.model.Video;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class VideoRepositoryTest {

    @Autowired
    private VideoRepository repository;

    @Test
    void testSaveAndFind() {
        Video video = new Video();
        video.setTitle("Test Video");
        video.setUrl("http://example.com/video.mp4");

        Video saved = repository.save(video);
        assertThat(saved.getId()).isNotNull();

        Video found = repository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("Test Video");
        assertThat(found.getUrl()).isEqualTo("http://example.com/video.mp4");
    }
}
