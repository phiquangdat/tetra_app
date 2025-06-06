package com.tetra.app.controller;

import com.tetra.app.model.Question;
import com.tetra.app.repository.QuestionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
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
    public Question create(@RequestBody Question question) {
        return questionRepository.save(question);
    }

    @PutMapping("/{id}")
    public Question update(@PathVariable UUID id, @RequestBody Question question) {
        question.setId(id);
        return questionRepository.save(question);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        questionRepository.deleteById(id);
    }
}
