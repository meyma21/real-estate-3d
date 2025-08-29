package com.realestate.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseService {
    private final Firestore firestore;
    private final Storage storage;
    private final String bucketName;

    @Autowired
    public FirebaseService(
            Firestore firestore,
            Storage storage,
            @Value("${firebase.storage.bucket}") String bucketName
    ) throws IOException {
        this.firestore = firestore;
        this.storage = storage; // injected bean already has proper credentials
        this.bucketName = bucketName;

        // Initialize Firebase App once (ensures StorageClient works elsewhere if needed)
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp();
        }
    }

    public <T> T save(String collection, String id, T entity) throws ExecutionException, InterruptedException {
        firestore.collection(collection).document(id).set(entity).get();
        return entity;
    }

    public <T> T findById(String collection, String id, Class<T> type) throws ExecutionException, InterruptedException {
        var doc = firestore.collection(collection).document(id).get().get();
        return doc.exists() ? doc.toObject(type) : null;
    }

    public <T> List<T> findAll(String collection, Class<T> type) throws ExecutionException, InterruptedException {
        return firestore.collection(collection).get().get().getDocuments().stream()
                .map(doc -> doc.toObject(type))
                .toList();
    }

    public <T> List<T> findByField(String collection, String field, Object value, Class<T> type) throws ExecutionException, InterruptedException {
        return firestore.collection(collection)
            .whereEqualTo(field, value)
            .get()
                .get()
                .getDocuments()
                .stream()
                .map(doc -> doc.toObject(type))
                .toList();
    }

    public void delete(String collection, String id) throws ExecutionException, InterruptedException {
        firestore.collection(collection).document(id).delete().get();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        
        storage.create(blobInfo, file.getBytes());
        
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }

    public String uploadFileToPath(MultipartFile file, String filePath) throws IOException {
        BlobId blobId = BlobId.of(bucketName, filePath);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        
        storage.create(blobInfo, file.getBytes());
        
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, filePath);
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        BlobId blobId = BlobId.of(bucketName, fileName);
        storage.delete(blobId);
    }

    public List<String> getFloorImages(String floorId) {
        try {
            List<String> imageUrls = new ArrayList<>();
            String prefix = "floors/" + floorId + "/";
            
            // List all blobs with the floor prefix
            com.google.api.gax.paging.Page<com.google.cloud.storage.Blob> blobsPage = storage.list(bucketName, Storage.BlobListOption.prefix(prefix));
            for (com.google.cloud.storage.Blob blob : blobsPage.iterateAll()) {
                if (blob.getName().endsWith(".jpg") || blob.getName().endsWith(".jpeg") || 
                    blob.getName().endsWith(".png") || blob.getName().endsWith(".webp")) {
                    // Generate signed URL for the image
                    String signedUrl = blob.signUrl(7, java.util.concurrent.TimeUnit.DAYS).toString();
                    imageUrls.add(signedUrl);
                }
            }
            
            // Sort by filename to maintain order
            imageUrls.sort(String::compareTo);
            return imageUrls;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<com.realestate.dto.FloorImageInfo> getFloorImageDetails(String floorId) {
        try {
            List<com.realestate.dto.FloorImageInfo> imageInfos = new ArrayList<>();
            String prefix = "floors/" + floorId + "/";
            
            // List all blobs with the floor prefix
            com.google.api.gax.paging.Page<com.google.cloud.storage.Blob> blobsPage = storage.list(bucketName, Storage.BlobListOption.prefix(prefix));
            for (com.google.cloud.storage.Blob blob : blobsPage.iterateAll()) {
                // Check if it's an image file
                boolean isImage = blob.getName().endsWith(".jpg") || blob.getName().endsWith(".jpeg") || 
                                 blob.getName().endsWith(".png") || blob.getName().endsWith(".webp") || 
                                 blob.getName().endsWith(".gif") || blob.getName().endsWith(".bmp");
                
                if (isImage) {
                    String signedUrl = blob.signUrl(7, java.util.concurrent.TimeUnit.DAYS).toString();
                    String fileName = blob.getName().substring(blob.getName().lastIndexOf("/") + 1);
                    
                    com.realestate.dto.FloorImageInfo imageInfo = new com.realestate.dto.FloorImageInfo(
                        fileName,
                        blob.getName(),
                        signedUrl,
                        blob.getSize() != null ? blob.getSize() : 0,
                        blob.getContentType(),
                        blob.getCreateTime() != null ? java.time.Instant.ofEpochMilli(blob.getCreateTime()) : java.time.Instant.now(),
                        true
                    );
                    imageInfos.add(imageInfo);
                }
            }
            
            // Sort by filename
            imageInfos.sort((a, b) -> a.getName().compareTo(b.getName()));
            return imageInfos;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public String uploadFloorImage(String floorId, MultipartFile file, String customFileName) throws IOException {
        String fileName = customFileName != null ? customFileName : file.getOriginalFilename();
        String filePath = "floors/" + floorId + "/" + fileName;
        return uploadFileToPath(file, filePath);
    }

    public boolean deleteFloorImage(String floorId, String fileName) {
        try {
            String filePath = "floors/" + floorId + "/" + fileName;
            BlobId blobId = BlobId.of(bucketName, filePath);
            return storage.delete(blobId);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean renameFloorImage(String floorId, String oldFileName, String newFileName) {
        try {
            String oldPath = "floors/" + floorId + "/" + oldFileName;
            String newPath = "floors/" + floorId + "/" + newFileName;
            
            // Get the existing blob
            BlobId oldBlobId = BlobId.of(bucketName, oldPath);
            com.google.cloud.storage.Blob oldBlob = storage.get(oldBlobId);
            
            if (oldBlob == null) {
                return false;
            }
            
            // Create new blob with same content
            BlobId newBlobId = BlobId.of(bucketName, newPath);
            BlobInfo newBlobInfo = BlobInfo.newBuilder(newBlobId)
                    .setContentType(oldBlob.getContentType())
                    .build();
            
            // Copy the content
            storage.create(newBlobInfo, oldBlob.getContent());
            
            // Delete the old blob
            storage.delete(oldBlobId);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public com.realestate.dto.FloorImageInfo getFloorImageInfo(String floorId, String fileName) {
        try {
            String filePath = "floors/" + floorId + "/" + fileName;
            BlobId blobId = BlobId.of(bucketName, filePath);
            com.google.cloud.storage.Blob blob = storage.get(blobId);
            
            if (blob != null) {
                String signedUrl = blob.signUrl(7, java.util.concurrent.TimeUnit.DAYS).toString();
                boolean isImage = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || 
                                 fileName.endsWith(".png") || fileName.endsWith(".webp") || 
                                 fileName.endsWith(".gif") || fileName.endsWith(".bmp");
                
                return new com.realestate.dto.FloorImageInfo(
                    fileName,
                    blob.getName(),
                    signedUrl,
                    blob.getSize() != null ? blob.getSize() : 0,
                    blob.getContentType(),
                    blob.getCreateTime() != null ? java.time.Instant.ofEpochMilli(blob.getCreateTime()) : java.time.Instant.now(),
                    isImage
                );
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
} 