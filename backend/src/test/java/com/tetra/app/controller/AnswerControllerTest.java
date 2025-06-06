package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.repository.AnswerRepository;
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

    @Autowired
    private ObjectMapper objectMapper;

    private Answer answer;
    private UUID answerId;
    private UUID questionId;

    @BeforeEach
    void setUp() {
        questionId = UUID.randomUUID();
        answerId = UUID.randomUUID();
        Question question = new Question();
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
                .andExpect(jsonPath("$[0].title").value("Sample Answer"));
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
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);
        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sample Answer"));
    }

    @Test
    void testUpdate() throws Exception {
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);
        mockMvc.perform(put("/api/answers/" + answerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answer)))
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
                .andExpect(jsonPath("$[0].question.id").value(questionId.toString()));
    }
}
