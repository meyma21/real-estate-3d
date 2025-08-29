package com.realestate.service;

import com.realestate.model.User;
import com.realestate.repository.UserRepository;
import com.google.cloud.Timestamp;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomUserDetailsService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByField("email", email)
            .stream()
            .findFirst()
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPassword())
            .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.isEnabled())
            .build();
    }

    public String createUser(User user) {
        if (userRepository.findByField("email", user.getEmail()).isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setCreatedAt(Timestamp.now());
            user.setUpdatedAt(Timestamp.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User already exists with email: " + user.getEmail());
    }

    public void updateUser(String id, User user) {
        user.setId(id);
        user.setUpdatedAt(Timestamp.now());
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        userRepository.update(id, user);
    }

    public void deleteUser(String id) {
        userRepository.delete(id);
    }

    public User getUser(String id) {
        return userRepository.findById(id);
    }
} 