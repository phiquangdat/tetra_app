package com.tetra.app.controller;

import com.tetra.app.model.Answer;
import com.tetra.app.repository.AnswerRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerRepository answerRepository;

    public AnswerController(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    @GetMapping
    public List<Answer> getAll() {
        return answerRepository.findAll();
    }

    @GetMapping("/by-question/{questionId}")
    public List<Answer> getByQuestion(@PathVariable UUID questionId) {
        return answerRepository.findByQuestionId(questionId);
    }

    @GetMapping("/{id}")
    public Answer getById(@PathVariable UUID id) {
        return answerRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Answer create(@RequestBody Answer answer) {
        return answerRepository.save(answer);
    }

    @PutMapping("/{id}")
    public Answer update(@PathVariable UUID id, @RequestBody Answer answer) {
        answer.setId(id);
        return answerRepository.save(answer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        answerRepository.deleteById(id);
    }
}
