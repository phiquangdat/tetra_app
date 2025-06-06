package com.tetra.app.controller;

import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.QuestionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private static final Logger logger = LoggerFactory.getLogger(AnswerController.class);

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    public AnswerController(AnswerRepository answerRepository, QuestionRepository questionRepository) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
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
    public ResponseEntity<?> create(@RequestBody Answer answer) {
        try {
            if (answer.getQuestion() == null || answer.getQuestion().getId() == null) {
                logger.error("Question id is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question id is required");
            }
            Question question = questionRepository.findById(answer.getQuestion().getId()).orElse(null);
            if (question == null) {
                logger.error("Question not found: {}", answer.getQuestion().getId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question not found");
            }
            answer.setQuestion(question);
            Answer saved = answerRepository.save(answer);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error creating answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Answer answer) {
        try {
            if (answer.getQuestion() == null || answer.getQuestion().getId() == null) {
                logger.error("Question id is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question id is required");
            }
            Question question = questionRepository.findById(answer.getQuestion().getId()).orElse(null);
            if (question == null) {
                logger.error("Question not found: {}", answer.getQuestion().getId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question not found");
            }
            answer.setId(id);
            answer.setQuestion(question);
            Answer saved = answerRepository.save(answer);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error updating answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        answerRepository.deleteById(id);
    }
}
