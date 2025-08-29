package com.realestate.config;

import com.google.cloud.firestore.Firestore;
import com.realestate.model.*;
import com.realestate.repository.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RepositoryConfig {

    @Bean
    public ApartmentRepository apartmentRepository(Firestore firestore) {
        return new ApartmentRepository(firestore);
    }

    @Bean
    public FloorRepository floorRepository(Firestore firestore) {
        return new FloorRepository(firestore);
    }

    @Bean
    public BuyerRepository buyerRepository(Firestore firestore) {
        return new BuyerRepository(firestore);
    }

    @Bean
    public UserRepository userRepository(Firestore firestore) {
        return new UserRepository(firestore);
    }

    @Bean
    public FirebaseRepository<Picture> pictureRepository(Firestore firestore) {
        return new FirebaseRepository<>(firestore, "pictures", Picture.class);
    }
} 