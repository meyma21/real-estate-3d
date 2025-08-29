package com.realestate.repository;

import com.google.cloud.firestore.Firestore;
import com.realestate.model.Buyer;

public class BuyerRepository extends FirebaseRepository<Buyer> {
    private static final String COLLECTION = "buyers";

    public BuyerRepository(Firestore firestore) {
        super(firestore, COLLECTION, Buyer.class);
    }
} 