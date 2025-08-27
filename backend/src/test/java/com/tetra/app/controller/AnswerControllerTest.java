package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.TestSecurityConfig;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.tetra.app.security.JwtUtil;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnswerController.class)
@Import(TestSecurityConfig.class)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnswerRepository answerRepository;

    @MockBean
    private QuestionRepository questionRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID questionId;
    private Question question;
    private Answer answer;

    @BeforeEach
    void mockJwtUtilForAllTests() {
        org.mockito.Mockito.when(jwtUtil.extractUserId(org.mockito.ArgumentMatchers.anyString())).thenReturn("user");
        org.mockito.Mockito.when(jwtUtil.extractRole(org.mockito.ArgumentMatchers.anyString())).thenReturn("ADMIN");
    }

    @BeforeEach
    void setup() {
        questionId = UUID.randomUUID();
        question = new Question();
        question.setId(questionId);
        question.setTitle("Sample Question");

        answer = new Answer();
        answer.setId(UUID.randomUUID());
        answer.setTitle("Test Answer");
        answer.setIsCorrect(true);
        answer.setSortOrder(1);
        answer.setQuestion(question);
    }

    @Test
    void testGetAllAnswers() throws Exception {
    when(answerRepository.findAll()).thenReturn(List.of(answer));
    String authHeader = "Bearer test-token";
    mockMvc.perform(get("/api/answers").header("Authorization", authHeader))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Test Answer"));
    }

    @Test
    void testGetAnswerById() throws Exception {
    when(answerRepository.findById(answer.getId())).thenReturn(Optional.of(answer));
    String authHeader = "Bearer test-token";
    mockMvc.perform(get("/api/answers/" + answer.getId()).header("Authorization", authHeader))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Test Answer"));
    }

    @Test
    void testGetByQuestion() throws Exception {
    when(answerRepository.findByQuestion_Id(questionId)).thenReturn(List.of(answer));
    String authHeader = "Bearer test-token";
    mockMvc.perform(get("/api/answers/by-question/" + questionId).header("Authorization", authHeader))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Test Answer"));
    }

    @Test
    void testCreateAnswerSuccess() throws Exception {
    Map<String, Object> body = new HashMap<>();
    body.put("question_id", questionId.toString());
    body.put("title", "New Answer");
    body.put("is_correct", true);
    body.put("sort_order", 1);

    when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
    when(answerRepository.save(any(Answer.class))).thenReturn(answer);
    String authHeader = "Bearer test-token";
    mockMvc.perform(post("/api/answers")
            .header("Authorization", authHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title").value("Test Answer"));
    }

    @Test
    void testCreateAnswerMissingFields() throws Exception {
    Map<String, Object> body = new HashMap<>();
    body.put("title", "Incomplete");
    String authHeader = "Bearer test-token";
    mockMvc.perform(post("/api/answers")
            .header("Authorization", authHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isBadRequest())
        .andExpect(content().string("question_id, title, is_correct, and sort_order are required"));
    }

    @Test
    public void testUpdateAnswer() throws Exception {
    UUID answerId = answer.getId();

    Map<String, Object> body = new HashMap<>();
    body.put("question_id", questionId.toString());
    body.put("title", "Updated Answer");
    body.put("is_correct", false);
    body.put("sort_order", 2);

    when(answerRepository.findById(answerId)).thenReturn(Optional.of(answer));
    when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

    Answer updatedAnswer = new Answer();
    updatedAnswer.setId(answerId);
    updatedAnswer.setTitle("Updated Answer");
    updatedAnswer.setIsCorrect(false);
    updatedAnswer.setSortOrder(2);
    updatedAnswer.setQuestion(question);

    when(answerRepository.save(any(Answer.class))).thenReturn(updatedAnswer);
    String authHeader = "Bearer test-token";
    mockMvc.perform(put("/api/answers/" + answerId)
            .header("Authorization", authHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Updated Answer"));
    }

    @Test
    void testDeleteAnswer() throws Exception {
    UUID answerId = UUID.randomUUID();
    doNothing().when(answerRepository).deleteById(answerId);
    String authHeader = "Bearer test-token";
    mockMvc.perform(delete("/api/answers/" + answerId).header("Authorization", authHeader))
        .andExpect(status().isOk());
    }
}