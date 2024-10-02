
# Google Drive API Integration with NestJS

This project demonstrates how to integrate **Google Drive API** with **NestJS** for file upload and download functionality. It allows users to upload files to Google Drive, rename files, set public permissions, and download files using a custom API endpoint.

## Features

- **Upload File to Google Drive**: Users can upload a file to Google Drive, where the file is temporarily stored on the server with a UUID name and uploaded to Google Drive with the user-defined file name.
- **Set Public Access**: After the file is uploaded, it is set to public, allowing anyone with the link to download it.
- **Download File from Google Drive**: Users can download a file from Google Drive using a custom API endpoint, with the original file name preserved.

## Google Drive API Setup

### 1. Enable Google Drive API
To use Google Drive API with this project, follow these steps:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Go to the **API & Services** section and enable the **Google Drive API**.
4. Navigate to the **Credentials** tab, click on **Create Credentials**, and select **Service Account**.

### 2. Create Service Account Credentials
1. After creating a service account, go to the **Keys** section.
2. Generate a new JSON key file for the service account.
3. Download the JSON key file and place it in your project directory (e.g., `./config/service-account.json`).

### 3. Set Environment Variable
In your `.env` file, add the following line:
```
GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-service-account-file.json
```

This allows the application to authenticate using the service account credentials.

## Installation

1. Clone the repository.
   ```bash
   git clone https://github.com/your-repository.git
   ```
2. Navigate to the project directory.
   ```bash
   cd your-repository
   ```
3. Install dependencies.
   ```bash
   npm install
   ```
4. Create a `.env` file with the following environment variable:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-google-service-account-file.json
   ```

## Google Drive API Setup

1. Create a **Google Cloud Project** and enable the **Google Drive API**.
2. Create a **Service Account** with access to the Drive API.
3. Download the service account JSON file and save it to your project directory.
4. Set the path to the service account file in the `.env` file as shown above.

## Usage

### 1. Upload File

#### Endpoint
```
POST /
```

#### Request
- **Form-data**:
  - `file`: File to be uploaded.
  - `fileName`: New name for the file (optional). If not provided, the original name will be used.

#### Example using Postman

1. Set the request method to `POST`.
2. Set the URL to: `http://localhost:3000/`.
3. Under **Body**, select **form-data**:
   - Add a `file` field with the file you want to upload.
   - Optionally add a `fileName` field with the desired file name.

#### Response
```json
{
  "success": true,
  "fileId": "Google Drive File ID",
  "message": "File 'uploaded-file-name.ext' successfully uploaded to Google Drive and set to public."
}
```

### 2. Download File

#### Endpoint
```
GET /:fileId
```

#### Request
- **Path Parameter**:
  - `fileId`: The ID of the file stored in Google Drive.

#### Example
1. Set the request method to `GET`.
2. Set the URL to: `http://localhost:3000/<fileId>`.
3. The file will be downloaded with the original name from Google Drive.

## Code Overview

### GoogleDriveService
- **`uploadFile(fileName, filePath)`**: Uploads the file to Google Drive and sets public access.
- **`setFilePublic(fileId)`**: Sets the uploaded file to public so anyone can download it.
- **`deleteLocalFile(filePath)`**: Deletes the local file after it has been uploaded to Google Drive.
- **`getFileMetadata(fileId)`**: Retrieves metadata (e.g., name) of the file from Google Drive.
- **`downloadFile(fileId)`**: Downloads the file from Google Drive as a stream.

### GoogleDriveController
- **`uploadFile(file, fileName)`**: Handles file upload requests, stores the file temporarily with a UUID name, and uploads it to Google Drive using the user-defined file name or original file name.
- **`downloadFile(fileId)`**: Handles requests to download files from Google Drive using the file ID.

## Example Configuration

Here's an example of your `.env` file:

```
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json
```

## Dependencies

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Googleapis**: A client library for accessing Google APIs.
- **Multer**: Middleware for handling multipart/form-data, used for file uploading.
- **UUID**: Library to generate unique identifiers for temporary file names.

## Running the Project

1. Start the server.
   ```bash
   npm run start
   ```
2. Access the API through `http://localhost:3000/`.

## License

This project is licensed under the MIT License.

## Credits
Created by [@muhyiddins](https://github.com/muhyiddins).
