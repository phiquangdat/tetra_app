package com.tetra.app.controller;

import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
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
import com.tetra.app.config.SecurityConfig;

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

    @Test
    void testGetAllUnitContent() throws Exception {
        // Arrange
        UnitContent content1 = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1");
        UnitContent content2 = new UnitContent(null, 2, "video", "Title 2", "Content 2", "http://example.com/2");
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findAll()).thenReturn(mockUnitContent);

        // Act & Assert
        mockMvc.perform(get("/api/unit_content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[1].title").value("Title 2"));
    }

    @Test
    void testGetUnitContentById_Success() throws Exception {
        // Arrange
        UUID contentId = UUID.randomUUID();
        UnitContent mockContent = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1");

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(mockContent));

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/" + contentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Title 1"));
    }

    @Test
    void testGetUnitContentById_NotFound() throws Exception {
        // Arrange
        UUID contentId = UUID.randomUUID();

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/" + contentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetUnitContentByUnitId_Success() throws Exception {
        // Arrange
        UUID unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        UUID contentId1 = UUID.randomUUID();
        UUID contentId2 = UUID.randomUUID();
        UnitContent content1 = new UnitContent(unit, 1, "text", "Title 1", "Content 1", "http://example.com/1");
        content1.setId(contentId1);
        UnitContent content2 = new UnitContent(unit, 2, "video", "Title 2", "Content 2", "http://example.com/2");
        content2.setId(contentId2);
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(mockUnitContent);

        // Act & Assert
        mockMvc.perform(get("/api/unit_content?unitId=" + unitId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[0].content_type").value("text"))
                .andExpect(jsonPath("$[0].sort_order").value(1));
    }

    @Test
    void testGetUnitContentByUnitId_NoContent() throws Exception {
        // Arrange
        UUID unitId = UUID.randomUUID();

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/unit_content?unitId=" + unitId))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testGetAllVideoContent_Success() throws Exception {
        // Arrange
        UUID videoId1 = UUID.randomUUID();
        UUID videoId2 = UUID.randomUUID();
        UnitContent video1 = new UnitContent(null, 1, "video", "Video Title 1", "video content 1", "http://example.com/video1.mp4");
        video1.setId(videoId1);
        UnitContent video2 = new UnitContent(null, 2, "video", "Video Title 2", "video content 2", "http://example.com/video2.mp4");
        video2.setId(videoId2);
        List<UnitContent> mockVideoContent = List.of(video1, video2);

        when(unitContentRepository.findByContentTypeIgnoreCase("video")).thenReturn(mockVideoContent);

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/video"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Video Title 1"))
                .andExpect(jsonPath("$[1].title").value("Video Title 2"));
    }

    @Test
    void testGetAllVideoContent_NoContent() throws Exception {
        // Arrange
        when(unitContentRepository.findByContentTypeIgnoreCase("video")).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/video"))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test
    void testGetVideoContent_Success() throws Exception {
        // Arrange
        UUID videoId = UUID.randomUUID();
        UnitContent video = new UnitContent(null, 1, "video", "Video Title", "video content data", "http://example.com/video.mp4");
        video.setId(videoId);

        when(unitContentRepository.findById(videoId)).thenReturn(Optional.of(video));

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(videoId.toString()))
                .andExpect(jsonPath("$.title").value("Video Title"))
                .andExpect(jsonPath("$.content").value("video content data"))
                .andExpect(jsonPath("$.url").value("http://example.com/video.mp4"));
    }

    @Test
    void testGetVideoContent_NotFound() throws Exception {
        // Arrange
        UUID videoId = UUID.randomUUID();
        when(unitContentRepository.findById(videoId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetVideoContent_NotVideoType() throws Exception {
        // Arrange
        UUID videoId = UUID.randomUUID();
        UnitContent notVideo = new UnitContent(null, 1, "text", "Not Video", "some content", "http://example.com/notvideo");
        notVideo.setId(videoId);

        when(unitContentRepository.findById(videoId)).thenReturn(Optional.of(notVideo));

        // Act & Assert
        mockMvc.perform(get("/api/unit_content/video/" + videoId))
                .andExpect(status().isNotFound());
    }
}
