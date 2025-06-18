package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UnitContentController.class)
public class UnitContentControllerTestPost {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitContentRepository unitContentRepository;

    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;

    @MockBean
    private com.tetra.app.repository.QuestionRepository questionRepository;

    @MockBean
    private com.tetra.app.repository.AnswerRepository answerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID unitId;

    @BeforeEach
    void setup() {
        unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
    }

    @Test
    void createQuizContent_success() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "title": "Test Quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1,
            "questions": [
              {
                "title": "2 + 2 = ?",
                "type": "single",
                "sort_order": 1,
                "answers": [
                  { "title": "3", "is_correct": false, "sort_order": 1 },
                  { "title": "4", "is_correct": true, "sort_order": 2 }
                ]
              }
            ]
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Test Quiz"))
                .andExpect(jsonPath("$.content_type").value("quiz"));
    }

    @Test
    void createQuizContent_unitNotFound() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "title": "Test Quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(UUID.randomUUID());

        Mockito.when(unitRepository.findById(Mockito.any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Unit not found")));
    }

    @Test
    void createQuizContent_missingTitle() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("title is required")));
    }

    @Test
    void createQuizContent_wrongContentType() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "title": "Test Quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("content_type must be 'quiz'")));
    }
}
