package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Question;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.UnitContentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionRepository questionRepository;

    @MockBean
    private UnitContentRepository unitContentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Question question;
    private UUID questionId;
    private UUID contentId;

    @BeforeEach
    void setUp() {
        contentId = UUID.randomUUID();
        questionId = UUID.randomUUID();
        UnitContent unitContent = new UnitContent();
        unitContent.setId(contentId);

        question = new Question();
        question.setId(questionId);
        question.setUnitContent(unitContent);
        question.setType("single");
        question.setTitle("Sample Question");
        question.setSortOrder(1);
    }

    @Test
    void testGetAll() throws Exception {
        when(questionRepository.findAll()).thenReturn(List.of(question));
        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Sample Question"));
    }

    @Test
    void testGetById() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        mockMvc.perform(get("/api/questions/" + questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(questionId.toString()));
    }

    @Test
    void testCreate() throws Exception {
        when(questionRepository.save(any(Question.class))).thenReturn(question);
        mockMvc.perform(post("/api/questions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(question)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sample Question"));
    }

    @Test
    void testUpdate() throws Exception {
        when(questionRepository.save(any(Question.class))).thenReturn(question);
        mockMvc.perform(put("/api/questions/" + questionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(question)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(questionId.toString()));
    }

    @Test
    void testDelete() throws Exception {
        doNothing().when(questionRepository).deleteById(questionId);
        mockMvc.perform(delete("/api/questions/" + questionId))
                .andExpect(status().isOk());
    }

    @Test
    void testGetByContent() throws Exception {
        when(questionRepository.findByUnitContentId(contentId)).thenReturn(List.of(question));
        mockMvc.perform(get("/api/questions/by-content/" + contentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].unitContent.id").value(contentId.toString()));
    }
}
