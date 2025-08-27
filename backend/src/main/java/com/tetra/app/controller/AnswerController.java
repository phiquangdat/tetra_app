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
    private final com.tetra.app.security.JwtUtil jwtUtil;

    public AnswerController(AnswerRepository answerRepository, QuestionRepository questionRepository, com.tetra.app.security.JwtUtil jwtUtil) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(answerRepository.findAll());
    }

    @GetMapping("/by-question/{questionId}")
    public ResponseEntity<?> getByQuestion(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable UUID questionId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(answerRepository.findByQuestion_Id(questionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable UUID id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(answerRepository.findById(id).orElse(null));
    }

    @PostMapping
    public ResponseEntity<?> create(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, Object> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
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

            String title = titleObj.toString();
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

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<?> update(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, Object> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        if (!body.containsKey("question_id") || !body.containsKey("title")
                || !body.containsKey("is_correct") || !body.containsKey("sort_order")) {
            logger.error("Missing required fields");
            return ResponseEntity.badRequest().body("question_id, title, is_correct, and sort_order are required");
        }

        try {
            UUID questionId = UUID.fromString(body.get("question_id").toString());

            Question question = questionRepository.findById(questionId).orElse(null);
            if (question == null) {
                logger.error("Question not found: {}", questionId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question not found");
            }

            Answer answer = answerRepository.findById(id).orElse(null);
            if (answer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Answer not found");
            }

            Object titleObj = body.get("title");
            Object isCorrectObj = body.get("is_correct");
            Object sortOrderObj = body.get("sort_order");

            answer.setQuestion(question);

            if (titleObj != null) {
                answer.setTitle(titleObj.toString());
            }

            if (isCorrectObj != null) {
                if (isCorrectObj instanceof Boolean) {
                    answer.setIsCorrect((Boolean) isCorrectObj);
                } else if (isCorrectObj instanceof String) {
                    answer.setIsCorrect(Boolean.parseBoolean((String) isCorrectObj));
                } else if (isCorrectObj instanceof Number) {
                    answer.setIsCorrect(((Number) isCorrectObj).intValue() != 0);
                }
            }

            if (sortOrderObj != null) {
                if (sortOrderObj instanceof Integer) {
                    answer.setSortOrder((Integer) sortOrderObj);
                } else if (sortOrderObj instanceof Number) {
                    answer.setSortOrder(((Number) sortOrderObj).intValue());
                } else if (sortOrderObj instanceof String) {
                    answer.setSortOrder(Integer.parseInt((String) sortOrderObj));
                }
            }

            Answer saved = answerRepository.save(answer);
            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid question_id format", e);
            return ResponseEntity.badRequest().body("Invalid question_id format");
        } catch (Exception e) {
            logger.error("Error updating answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal Server Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        answerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}