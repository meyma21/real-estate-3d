package com.realestate.repository;

import com.google.cloud.firestore.Firestore;
import com.realestate.model.Floor;

public class FloorRepository extends FirebaseRepository<Floor> {
    private static final String COLLECTION = "floors";

    public FloorRepository(Firestore firestore) {
        super(firestore, COLLECTION, Floor.class);
    }
} 