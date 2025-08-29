package com.realestate.service;

import com.realestate.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {
    private final FirebaseService firebaseService;
    private final PasswordEncoder passwordEncoder;
    private static final String COLLECTION_NAME = "users";

    public UserService(FirebaseService firebaseService, PasswordEncoder passwordEncoder) {
        this.firebaseService = firebaseService;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) throws ExecutionException, InterruptedException {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return firebaseService.save(COLLECTION_NAME, user.getId(), user);
    }

    public User getUserById(String id) throws ExecutionException, InterruptedException {
        return firebaseService.findById(COLLECTION_NAME, id, User.class);
    }

    public User getUserByUsername(String username) throws ExecutionException, InterruptedException {
        List<User> users = firebaseService.findByField(COLLECTION_NAME, "username", username, User.class);
        return users.isEmpty() ? null : users.get(0);
    }

    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        return firebaseService.findAll(COLLECTION_NAME, User.class);
    }

    public User updateUser(String id, User user) throws ExecutionException, InterruptedException {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return firebaseService.save(COLLECTION_NAME, id, user);
    }

    public void deleteUser(String id) throws ExecutionException, InterruptedException {
        firebaseService.delete(COLLECTION_NAME, id);
    }
} 