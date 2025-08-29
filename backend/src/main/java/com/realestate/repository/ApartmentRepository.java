package com.realestate.repository;

import com.google.cloud.firestore.Firestore;
import com.realestate.model.Apartment;

public class ApartmentRepository extends FirebaseRepository<Apartment> {
    private static final String COLLECTION = "apartments";

    public ApartmentRepository(Firestore firestore) {
        super(firestore, COLLECTION, Apartment.class);
    }
} 