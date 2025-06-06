package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnswerController.class)
@AutoConfigureMockMvc(addFilters = false)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnswerRepository answerRepository;

    @MockBean
    private QuestionRepository questionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Answer answer;
    private UUID answerId;
    private UUID questionId;
    private Question question;

    @BeforeEach
    void setUp() {
        questionId = UUID.randomUUID();
        answerId = UUID.randomUUID();
        question = new Question();
        question.setId(questionId);

        answer = new Answer();
        answer.setId(answerId);
        answer.setQuestion(question);
        answer.setTitle("Sample Answer");
        answer.setIsCorrect(true);
        answer.setSortOrder(1);
    }

    @Test
    void testGetAll() throws Exception {
        when(answerRepository.findAll()).thenReturn(List.of(answer));
        mockMvc.perform(get("/api/answers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Sample Answer"))
                .andExpect(jsonPath("$[0].questionId").value(questionId.toString()));
    }

    @Test
    void testGetById() throws Exception {
        when(answerRepository.findById(answerId)).thenReturn(Optional.of(answer));
        mockMvc.perform(get("/api/answers/" + answerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(answerId.toString()));
    }

    @Test
    void testCreate() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);

        Map<String, Object> answerMap = new HashMap<>();
        answerMap.put("title", "Sample Answer");
        answerMap.put("isCorrect", true);
        answerMap.put("sortOrder", 1);
        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("id", questionId.toString());
        answerMap.put("question", questionMap);

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sample Answer"));
    }

    @Test
    void testCreateWithoutQuestionId() throws Exception {
        Map<String, Object> answerMap = new HashMap<>();
        answerMap.put("title", "Sample Answer");
        answerMap.put("isCorrect", true);
        answerMap.put("sortOrder", 1);
        answerMap.put("question", new HashMap<>());

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerMap)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Question id is required"));
    }

    @Test
    void testCreateWithNonexistentQuestion() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.empty());

        Map<String, Object> answerMap = new HashMap<>();
        answerMap.put("title", "Sample Answer");
        answerMap.put("isCorrect", true);
        answerMap.put("sortOrder", 1);
        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("id", questionId.toString());
        answerMap.put("question", questionMap);

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerMap)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Question not found"));
    }

    @Test
    void testUpdate() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);

        Map<String, Object> answerMap = new HashMap<>();
        answerMap.put("title", "Sample Answer");
        answerMap.put("isCorrect", true);
        answerMap.put("sortOrder", 1);
        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("id", questionId.toString());
        answerMap.put("question", questionMap);

        mockMvc.perform(put("/api/answers/" + answerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(answerId.toString()));
    }

    @Test
    void testDelete() throws Exception {
        doNothing().when(answerRepository).deleteById(answerId);
        mockMvc.perform(delete("/api/answers/" + answerId))
                .andExpect(status().isOk());
    }

    @Test
    void testGetByQuestion() throws Exception {
        when(answerRepository.findByQuestionId(questionId)).thenReturn(List.of(answer));
        mockMvc.perform(get("/api/answers/by-question/" + questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].questionId").value(questionId.toString()));
    }
}
