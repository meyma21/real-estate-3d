package com.realestate.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FirebaseRepository<T> {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseRepository.class);
    protected final Firestore firestore;
    private final String collectionName;
    private final Class<T> entityClass;

    public FirebaseRepository(Firestore firestore, String collectionName, Class<T> entityClass) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.entityClass = entityClass;
    }

    public String save(T entity) {
        try {
            DocumentReference docRef = firestore.collection(collectionName).document();
            Map<String, Object> data = convertToMap(entity);
            data.put("id", docRef.getId());
            data.put("createdAt", FieldValue.serverTimestamp());
            data.put("updatedAt", FieldValue.serverTimestamp());
            
            ApiFuture<WriteResult> result = docRef.set(data);
            result.get(); // Wait for completion
            return docRef.getId();
        } catch (Exception e) {
            logger.error("Error saving document to {}: {}", collectionName, e.getMessage());
            throw new RuntimeException("Error saving document", e);
        }
    }

    public void update(String id, T entity) {
        try {
            DocumentReference docRef = firestore.collection(collectionName).document(id);
            Map<String, Object> data = convertToMap(entity);
            data.put("updatedAt", FieldValue.serverTimestamp());
            
            ApiFuture<WriteResult> result = docRef.update(data);
            result.get(); // Wait for completion
        } catch (Exception e) {
            logger.error("Error updating document {}/{}: {}", collectionName, id, e.getMessage());
            throw new RuntimeException("Error updating document", e);
        }
    }

    public void delete(String id) {
        try {
            DocumentReference docRef = firestore.collection(collectionName).document(id);
            ApiFuture<WriteResult> result = docRef.delete();
            result.get(); // Wait for completion
        } catch (Exception e) {
            logger.error("Error deleting document {}/{}: {}", collectionName, id, e.getMessage());
            throw new RuntimeException("Error deleting document", e);
        }
    }

    public T findById(String id) {
        try {
            DocumentReference docRef = firestore.collection(collectionName).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                return document.toObject(entityClass);
            }
            return null;
        } catch (Exception e) {
            logger.error("Error finding document {}/{}: {}", collectionName, id, e.getMessage());
            throw new RuntimeException("Error finding document", e);
        }
    }

    public List<T> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(collectionName).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                .map(doc -> doc.toObject(entityClass))
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error finding all documents in {}: {}", collectionName, e.getMessage());
            throw new RuntimeException("Error finding all documents", e);
        }
    }

    public List<T> findByField(String field, Object value) {
        try {
            Query query = firestore.collection(collectionName).whereEqualTo(field, value);
            ApiFuture<QuerySnapshot> future = query.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                .map(doc -> doc.toObject(entityClass))
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error finding documents by field in {}: {}", collectionName, e.getMessage());
            throw new RuntimeException("Error finding documents by field", e);
        }
    }

    protected Map<String, Object> convertToMap(T entity) {
        try {
            DocumentReference tempDoc = firestore.collection("_temp").document();
            ApiFuture<WriteResult> future = tempDoc.set(entity);
            future.get();
            
            DocumentSnapshot snapshot = tempDoc.get().get();
            Map<String, Object> data = snapshot.getData();
            
            tempDoc.delete().get();
            return data;
        } catch (Exception e) {
            logger.error("Error converting entity to map: {}", e.getMessage());
            throw new RuntimeException("Error converting entity to map", e);
        }
    }
} 