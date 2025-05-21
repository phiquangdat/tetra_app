package com.tetra.app.controller;

import com.tetra.app.service.HelloService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.SuppressWarnings;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HelloFromDbController.class)
@SuppressWarnings("removal")
class HelloFromDbControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private HelloService helloService;

    @Test
    void testHelloFromDb() throws Exception {
        when(helloService.testConnection()).thenReturn("Connection to the database successful!");
        mockMvc.perform(get("/db-hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("Connection to the database successful!"));
    }
}
