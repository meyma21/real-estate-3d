package com.realestate.repository;

import com.google.cloud.firestore.Firestore;
import com.realestate.model.User;

public class UserRepository extends FirebaseRepository<User> {
    private static final String COLLECTION = "users";

    public UserRepository(Firestore firestore) {
        super(firestore, COLLECTION, User.class);
    }
} 