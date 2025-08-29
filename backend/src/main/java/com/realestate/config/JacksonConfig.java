package com.realestate.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.cloud.Timestamp;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Add Java Time module for handling Instant, LocalDateTime, etc.
        objectMapper.registerModule(new JavaTimeModule());
        
        // Add custom module for Google Cloud Timestamp
        SimpleModule timestampModule = new SimpleModule();
        timestampModule.addSerializer(Timestamp.class, new TimestampSerializer());
        timestampModule.addDeserializer(Timestamp.class, new TimestampDeserializer());
        
        objectMapper.registerModule(timestampModule);
        
        return objectMapper;
    }
}
