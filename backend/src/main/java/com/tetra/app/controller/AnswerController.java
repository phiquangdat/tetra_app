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
import java.util.Map;
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
        return answerRepository.findByQuestion_Id(questionId);
    }

    @GetMapping("/{id}")
    public Answer getById(@PathVariable UUID id) {
        return answerRepository.findById(id).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Object questionIdObj = body.get("question_id");
            Object titleObj = body.get("title");
            Object isCorrectObj = body.get("is_correct");
            Object sortOrderObj = body.get("sort_order");

            if (questionIdObj == null || titleObj == null || isCorrectObj == null || sortOrderObj == null) {
                logger.error("Missing required fields");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("question_id, title, is_correct, and sort_order are required");
            }

            UUID questionId;
            try {
                questionId = UUID.fromString(questionIdObj.toString());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid question_id format");
            }

            Question question = questionRepository.findById(questionId).orElse(null);
            if (question == null) {
                logger.error("Question not found: {}", questionId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question not found");
            }

            String title = titleObj != null ? titleObj.toString() : null;
            Boolean isCorrect = false;
            if (isCorrectObj instanceof Boolean) {
                isCorrect = (Boolean) isCorrectObj;
            } else if (isCorrectObj instanceof String) {
                isCorrect = Boolean.parseBoolean((String) isCorrectObj);
            } else if (isCorrectObj instanceof Number) {
                isCorrect = ((Number) isCorrectObj).intValue() != 0;
            }

            Integer sortOrder = null;
            if (sortOrderObj instanceof Integer) {
                sortOrder = (Integer) sortOrderObj;
            } else if (sortOrderObj instanceof Number) {
                sortOrder = ((Number) sortOrderObj).intValue();
            } else if (sortOrderObj instanceof String) {
                sortOrder = Integer.parseInt((String) sortOrderObj);
            }

            Answer answer = new Answer();
            answer.setQuestion(question);
            answer.setTitle(title);
            answer.setIsCorrect(isCorrect);
            answer.setSortOrder(sortOrder);

            Answer saved = answerRepository.save(answer);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            logger.error("Error creating answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal Server Error: " + e.getMessage());
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


