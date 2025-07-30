package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.config.SecurityConfig;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(UnitContentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
@ExtendWith(MockitoExtension.class)
public class UnitContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitContentRepository unitContentRepository;
    @MockBean
    private com.tetra.app.repository.QuestionRepository questionRepository;
    @MockBean
    private com.tetra.app.repository.AnswerRepository answerRepository;
    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;
    @MockBean
    private com.tetra.app.security.JwtUtil jwtUtil;
    @MockBean
    private com.tetra.app.repository.BlacklistedTokenRepository blacklistedTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllUnitContent() throws Exception {
        
        UnitContent content1 = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1", 0, 0);
        UnitContent content2 = new UnitContent(null, 2, "video", "Title 2", "Content 2", "http://example.com/2", 0, 0);
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findAll()).thenReturn(mockUnitContent);

        
        mockMvc.perform(get("/api/unit_content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[1].title").value("Title 2"));
    }

    @Test
    void testGetUnitContentById_Success() throws Exception {
        
        UUID contentId = UUID.randomUUID();
        UnitContent mockContent = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1", 0, 0);

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(mockContent));

        
        mockMvc.perform(get("/api/unit_content/" + contentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Title 1"));
    }

    @Test
    void testGetUnitContentById_NotFound() throws Exception {
        
        UUID contentId = UUID.randomUUID();

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.empty());

        
        mockMvc.perform(get("/api/unit_content/" + contentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetUnitContentByUnitId_Success() throws Exception {
        
        UUID unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        UUID contentId1 = UUID.randomUUID();
        UUID contentId2 = UUID.randomUUID();
        UnitContent content1 = new UnitContent(unit, 1, "text", "Title 1", "Content 1", "http://example.com/1", 0, 0);
        content1.setId(contentId1);
        UnitContent content2 = new UnitContent(unit, 2, "video", "Title 2", "Content 2", "http://example.com/2", 0, 0);
        content2.setId(contentId2);
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(mockUnitContent);

        
        mockMvc.perform(get("/api/unit_content?unitId=" + unitId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[0].content_type").value("text"))
                .andExpect(jsonPath("$[0].sort_order").value(1));
    }

    @Test
    void testGetUnitContentByUnitId_NoContent() throws Exception {
       
        UUID unitId = UUID.randomUUID();

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(Collections.emptyList());

        
        mockMvc.perform(get("/api/unit_content?unitId=" + unitId))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testGetAllVideoContent_Success() throws Exception {
        
        UUID videoId1 = UUID.randomUUID();
        UUID videoId2 = UUID.randomUUID();
        UnitContent video1 = new UnitContent(null, 1, "video", "Video Title 1", "video content 1", "http://example.com/video1.mp4", 0, 0);
        video1.setId(videoId1);
        UnitContent video2 = new UnitContent(null, 2, "video", "Video Title 2", "video content 2", "http://example.com/video2.mp4", 0, 0);
        video2.setId(videoId2);
        List<UnitContent> mockVideoContent = List.of(video1, video2);

        when(unitContentRepository.findByContentTypeIgnoreCase("video")).thenReturn(mockVideoContent);

        
        mockMvc.perform(get("/api/unit_content/video"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Video Title 1"))
                .andExpect(jsonPath("$[1].title").value("Video Title 2"));
    }

    @Test
    void testGetAllVideoContent_NoContent() throws Exception {
        
        when(unitContentRepository.findByContentTypeIgnoreCase("video")).thenReturn(Collections.emptyList());

        
        mockMvc.perform(get("/api/unit_content/video"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testGetVideoContent_Success() throws Exception {
        
        UUID videoId = UUID.randomUUID();
        UnitContent video = new UnitContent(null, 1, "video", "Video Title", "video content data", "http://example.com/video.mp4", 0, 0);
        video.setId(videoId);

        when(unitContentRepository.findById(videoId)).thenReturn(Optional.of(video));

        
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(videoId.toString()))
                .andExpect(jsonPath("$.title").value("Video Title"))
                .andExpect(jsonPath("$.content").value("video content data"))
                .andExpect(jsonPath("$.url").value("http://example.com/video.mp4"));
    }

    @Test
    void testGetVideoContent_NotFound() throws Exception {
        
        UUID videoId = UUID.randomUUID();
        when(unitContentRepository.findById(videoId)).thenReturn(Optional.empty());

        
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetVideoContent_NotVideoType() throws Exception {
        
        UUID videoId = UUID.randomUUID();
        UnitContent notVideo = new UnitContent(null, 1, "text", "Not Video", "some content", "http://example.com/notvideo", 0, 0);
        notVideo.setId(videoId);

        when(unitContentRepository.findById(videoId)).thenReturn(Optional.of(notVideo));

        
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetArticleContent_Success() throws Exception {
        UUID articleId = UUID.randomUUID();
        UnitContent article = new UnitContent(null, 1, "article", "Article Title", "article content data", null, 0, 0);
        article.setId(articleId);

        when(unitContentRepository.findByIdAndContentTypeIgnoreCase(articleId, "article")).thenReturn(Optional.of(article));

        mockMvc.perform(get("/api/unit_content/article/" + articleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(articleId.toString()))
                .andExpect(jsonPath("$.title").value("Article Title"))
                .andExpect(jsonPath("$.content").value("article content data"));
    }

    @Test
    void testGetArticleContent_NotFound() throws Exception {
        UUID articleId = UUID.randomUUID();
        when(unitContentRepository.findByIdAndContentTypeIgnoreCase(articleId, "article")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/unit_content/article/" + articleId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetArticleContent_NotArticleType() throws Exception {
        UUID articleId = UUID.randomUUID();
        UnitContent notArticle = new UnitContent(null, 1, "video", "Not Article", "some content", null, 0, 0);
        notArticle.setId(articleId);

        when(unitContentRepository.findByIdAndContentTypeIgnoreCase(articleId, "article")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/unit_content/article/" + articleId))
                .andExpect(status().isNotFound());
    }
}

