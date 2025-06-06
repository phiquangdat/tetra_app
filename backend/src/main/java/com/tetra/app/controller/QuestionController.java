package com.tetra.app.controller;

import com.tetra.app.model.Question;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.UnitContentRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final UnitContentRepository unitContentRepository;

    public QuestionController(QuestionRepository questionRepository, UnitContentRepository unitContentRepository) {
        this.questionRepository = questionRepository;
        this.unitContentRepository = unitContentRepository;
    }

    @GetMapping
    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    @GetMapping("/by-content/{contentId}")
    public List<Question> getByContent(@PathVariable UUID contentId) {
        return questionRepository.findByUnitContentId(contentId);
    }

    @GetMapping("/{id}")
    public Question getById(@PathVariable UUID id) {
        return questionRepository.findById(id).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Question question) {
        if (question.getUnitContent() == null || question.getUnitContent().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent id is required");
        }
        UnitContent unitContent = unitContentRepository.findById(question.getUnitContent().getId()).orElse(null);
        if (unitContent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent not found");
        }
        question.setUnitContent(unitContent);
        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Question question) {
        if (question.getUnitContent() == null || question.getUnitContent().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent id is required");
        }
        UnitContent unitContent = unitContentRepository.findById(question.getUnitContent().getId()).orElse(null);
        if (unitContent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent not found");
        }
        question.setId(id);
        question.setUnitContent(unitContent);
        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        questionRepository.deleteById(id);
    }
}
