package com.tetra.app.controller;

import com.tetra.app.service.HelloService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloFromDbController {

    private final HelloService helloService;

    public HelloFromDbController(HelloService helloService) {
        this.helloService = helloService;
    }

    @GetMapping("/db-hello")
    public String hello() {
        System.out.println("The request came to /db-hello");
        return helloService.testConnection();
    }
}