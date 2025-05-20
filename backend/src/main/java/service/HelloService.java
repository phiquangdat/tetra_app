package com.tetra.app.service;

import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;

@Service
public class HelloService {

    private final DataSource dataSource;

    public HelloService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public String testConnection() {
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("Connection to the database has been successfully established.");
            if (conn.isValid(2)) {
                return "Connection to the database successful!";
            } else {
                return "Failed to establish connection to the database.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error connecting to the database:" + e.getMessage();
        }
    }
}