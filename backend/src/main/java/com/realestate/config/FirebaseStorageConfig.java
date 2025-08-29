package com.realestate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class FirebaseStorageConfig {

    @Bean
    public Storage firebaseStorage() throws IOException {
        GoogleCredentials credentials = GoogleCredentials.fromStream(
            new ClassPathResource("firebase-service-account.json").getInputStream()
        );
        
        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .setProjectId("real-estate-vis-management-sys")
                .build()
                .getService();
    }
} 