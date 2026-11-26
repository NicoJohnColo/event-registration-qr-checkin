package com.nicojohn.eventreg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EventRegApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventRegApplication.class, args);
    }
}
