# File Upload Endpoint Documentation

## Overview
The file upload endpoint allows users to upload files to the server and store their metadata in the database.

## Endpoint Details

### POST /api/uploads
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required (Bearer token)

### Parameters
- `file` (required): The file to upload

### Request Example
```bash
curl -X POST http://localhost:8080/api/uploads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.txt"
```

### Response Format
```json
{
  "file_id": "uuid-string",
  "original_name": "original-filename.txt",
  "mime": "text/plain",
  "size": 1024,
  "storage_path": "uuid-filename.txt"
}
```

## Validation Rules

### File Size
- Maximum file size: 50 MB
- Files exceeding this limit will return a 400 Bad Request error

### File Format
- Any file format is accepted
- MIME type is automatically detected from the uploaded file

### Authentication
- Valid JWT token required in Authorization header
- Token must not be blacklisted (logged out)

## File Storage

### Physical Storage
- Files are saved to the `uploads/` directory (configurable via `file.upload-dir` property)
- Each file gets a unique filename: `UUID + original file extension`
- Example: `550e8400-e29b-41d4-a716-446655440000.txt`

### Database Storage
- File metadata is stored in the `attachments` table
- Fields: `id`, `name`, `mime`, `size`, `storage_path`

## Error Responses

### 400 Bad Request
- File is empty
- File size exceeds 50 MB limit

### 401 Unauthorized
- Missing or invalid Authorization header
- Invalid JWT token
- Token is blacklisted (logged out)

### 500 Internal Server Error
- File system errors
- Database errors

## Configuration

### Application Properties
```properties
# File upload directory
file.upload-dir=uploads

# Multipart file upload configuration
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true
```

## Testing

### Unit Tests
Run the test suite to verify functionality:
```bash
./gradlew test --tests FileUploadControllerTest
```

### Integration Tests
Run integration tests:
```bash
./gradlew test --tests FileUploadIntegrationTest
```

### Manual Testing
1. Start the application
2. Obtain a valid JWT token by logging in
3. Use curl or Postman to upload a file:
   ```bash
   curl -X POST http://localhost:8080/api/uploads \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-upload-example.txt"
   ```
4. Verify the response contains the expected fields
5. Check that the file exists in the uploads directory
6. Verify the metadata is saved in the database

## Security Considerations

1. **Authentication**: All uploads require valid JWT authentication
2. **File Size Limits**: 50MB maximum to prevent abuse
3. **Unique Filenames**: UUID-based naming prevents filename conflicts
4. **Input Validation**: File content type and size are validated
5. **Error Handling**: Proper error responses without exposing system details

## Usage Examples

### JavaScript/Fetch API
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/uploads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Python/Requests
```python
import requests

files = {'file': open('document.pdf', 'rb')}
headers = {'Authorization': 'Bearer YOUR_TOKEN'}

response = requests.post('http://localhost:8080/api/uploads', 
                        files=files, 
                        headers=headers)
print(response.json())
```
