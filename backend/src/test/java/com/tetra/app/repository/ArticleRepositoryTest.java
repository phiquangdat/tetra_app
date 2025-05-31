package com.tetra.app.repository;

import com.tetra.app.model.Article;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ArticleRepositoryTest {

    @Autowired
    private ArticleRepository repository;

    @Test
    void testSaveAndFind() {
        Article article = new Article();
        article.setTitle("Test Article");
        article.setContent("Some content");

        Article saved = repository.save(article);
        assertThat(saved.getId()).isNotNull();

        Article found = repository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("Test Article");
        assertThat(found.getContent()).isEqualTo("Some content");
    }
}
