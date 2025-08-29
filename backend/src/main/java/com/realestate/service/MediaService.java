package com.realestate.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final Storage storage;
    private static final String BUCKET_NAME = "real-estate-3d-visualization.appspot.com";

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        String filePath = folder + "/" + fileName;
        
        BlobId blobId = BlobId.of(BUCKET_NAME, filePath);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        
        storage.create(blobInfo, file.getBytes());
        
        return getSignedUrl(filePath);
    }

    public void deleteFile(String filePath) {
        BlobId blobId = BlobId.of(BUCKET_NAME, filePath);
        storage.delete(blobId);
    }

    public String getSignedUrl(String filePath) {
        BlobId blobId = BlobId.of(BUCKET_NAME, filePath);
        Blob blob = storage.get(blobId);
        
        if (blob != null) {
            return blob.signUrl(7, TimeUnit.DAYS).toString();
        }
        return null;
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }

    public boolean isFileExists(String filePath) {
        BlobId blobId = BlobId.of(BUCKET_NAME, filePath);
        Blob blob = storage.get(blobId);
        return blob != null;
    }
} 