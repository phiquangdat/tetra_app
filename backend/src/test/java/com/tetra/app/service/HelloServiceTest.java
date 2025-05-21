package com.tetra.app.service;

import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HelloServiceTest {

    @Test
    void testConnectionSuccess() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(anyInt())).thenReturn(true);

        HelloService service = new HelloService(dataSource);
        String result = service.testConnection();

        assertTrue(result.contains("successful"));
        verify(connection).close();
    }

    @Test
    void testConnectionFailure() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        when(dataSource.getConnection()).thenThrow(new RuntimeException("fail"));

        HelloService service = new HelloService(dataSource);
        String result = service.testConnection();

        assertTrue(result.contains("Error connecting"));
    }
}
