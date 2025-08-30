package com.realestate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.private-key}")
    private String privateKey;

    @Value("${firebase.client-email}")
    private String clientEmail;

    @Bean
    public Firestore firestore() throws IOException {
        // Initialize Firebase if it hasn't been initialized yet
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                createServiceAccountStream()
            );

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build();

            FirebaseApp.initializeApp(options);
        }

        return FirestoreClient.getFirestore();
    }

    private InputStream createServiceAccountStream() {
        // Create complete service account JSON from environment variables
        String serviceAccountJson = String.format(
            "{\"type\":\"service_account\",\"project_id\":\"%s\",\"private_key_id\":\"%s\",\"private_key\":\"%s\",\"client_email\":\"%s\",\"client_id\":\"%s\",\"auth_uri\":\"https://accounts.google.com/o/oauth2/auth\",\"token_uri\":\"https://oauth2.googleapis.com/token\",\"auth_provider_x509_cert_url\":\"https://www.googleapis.com/oauth2/v1/certs\",\"client_x509_cert_url\":\"https://www.googleapis.com/robot/v1/metadata/x509/%s\"}",
            projectId,
            "7797de104a8bd903bc1d6ae0a7992ee0539a39d1", // From your Firebase JSON
            privateKey.replace("\\n", "\n"),
            clientEmail,
            "106528771524583225591", // From your Firebase JSON
            clientEmail.replace("@", "%40") // URL encode the email
        );
        
        return new java.io.ByteArrayInputStream(serviceAccountJson.getBytes());
    }

    @Bean
    public String[] requiredCollections() {
        return new String[] {
            "floors",
            "apartments",
            "buyers",
            "pictures",
            "users"
        };
    }
} 