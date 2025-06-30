# OpenMusic API Documentation

## Overview

The OpenMusic API is a RESTful API designed for music playlist management, built with JavaScript, Node.js, and the Hapi.js framework. It supports features like playlist creation, song management, user authentication, and album cover uploads. The API uses PostgreSQL for data storage, Redis for caching, and RabbitMQ for exporting playlists.

This documentation provides details on how to set up, configure, and use the API, including available endpoints and their functionalities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Albums](#albums)
  - [Songs](#songs)
  - [Playlists](#playlists)
  - [Collaborations](#collaborations)
  - [Export Playlists](#export-playlists)
- [Error Handling](#error-handling)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

To run the OpenMusic API locally, ensure you have the following installed:

- **Node.js** (v14 or higher recommended)
- **PostgreSQL** (v13 or higher)
- **Redis** (v6 or higher)
- **RabbitMQ** (v3.9 or higher)
- A compatible queue consumer for playlist exports (e.g., [OpenMusic Queue Consumer](https://github.com/gatraenggar/dicoding-openmusic-queue-consumer))[](https://github.com/gatraenggar/dicoding-openmusic-be)
- Git for cloning the repository
- npm for package management

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Ftthreign/openMusic-api-js.git
   cd openMusic-api-js/openmusic-api
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up the Database**:
   - Create a PostgreSQL database for the API.
   - Run the database migrations to set up the necessary tables:
     ```bash
     npm run migrate up
     ```

## Configuration

1. **Environment Variables**:

   - Rename `example.env` to `.env` in the project root.
   - Update the `.env` file with your configuration:

     ```env
     # Database
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=your_database_name
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password

     # JWT Authentication
     ACCESS_TOKEN_KEY=your_access_token_key
     REFRESH_TOKEN_KEY=your_refresh_token_key

     # Mail (for playlist export)
     MAIL_HOST=smtp.yourmailserver.com
     MAIL_PORT=587
     MAIL_ADDRESS=your_email@example.com
     MAIL_PASSWORD=your_email_password

     # Redis
     REDIS_HOST=localhost
     REDIS_PORT=6379

     # RabbitMQ
     RABBITMQ_SERVER=amqp://localhost
     ```

   - Generate secure keys for `ACCESS_TOKEN_KEY` and `REFRESH_TOKEN_KEY` using a secure random generator.

2. **Database Schema**:
   The API uses a PostgreSQL database with tables for:

   - Users
   - Albums
   - Songs
   - Playlists
   - Collaborations
   - Junction tables for playlist-song relationships

   Refer to the migration files in the repository for the exact schema.

## Running the API

1. Start Redis and RabbitMQ services on your machine.
2. Run the API:
   ```bash
   npm start
   ```
3. The API will be available at `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

The API provides endpoints for managing albums, songs, playlists, and user authentication. All endpoints require authentication unless specified otherwise.

### Authentication

- **POST /authentications**

  - **Description**: Authenticate a user and obtain access and refresh tokens.
  - **Request Body**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "string",
        "refreshToken": "string"
      }
    }
    ```

- **POST /authentications/refresh**

  - **Description**: Refresh an access token using a refresh token.
  - **Request Body**:
    ```json
    {
      "refreshToken": "string"
    }
    ```
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "string"
      }
    }
    ```

- **DELETE /authentications**
  - **Description**: Log out by invalidating a refresh token.
  - **Request Body**:
    ```json
    {
      "refreshToken": "string"
    }
    ```
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "message": "Refresh token deleted"
    }
    ```

### Albums

- **POST /albums**

  - **Description**: Create a new album.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "name": "string",
      "year": number
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "data": {
        "albumId": "string"
      }
    }
    ```

- **GET /albums/{id}**
  - **Description**: Retrieve an album by ID.
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "data": {
        "album": {
          "id": "string",
          "name": "string",
          "year": number,
          "coverUrl": "string"
        }
      }
    }
    ```

### Songs

- **POST /songs**

  - **Description**: Add a new song.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "title": "string",
      "year": number,
      "performer": "string",
      "genre": "string",
      "duration": number,
      "albumId": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "data": {
        "songId": "string"
      }
    }
    ```

- **GET /songs**
  - **Description**: Retrieve songs with optional filtering by title or performer.
  - **Query Parameters**:
    - `title` (optional): Filter by song title.
    - `performer` (optional): Filter by performer.
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "data": {
        "songs": [
          {
            "id": "string",
            "title": "string",
            "performer": "string"
          }
        ]
      }
    }
    ```

### Playlists

- **POST /playlists**

  - **Description**: Create a new playlist.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "name": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "data": {
        "playlistId": "string"
      }
    }
    ```

- **GET /playlists**

  - **Description**: Retrieve playlists owned or collaborated on by the authenticated user.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Response** (200 OK):
    ```json
    {
      "status": "success",
      "data": {
        "playlists": [
          {
            "id": "string",
            "name": "string",
            "username": "string"
          }
        ]
      }
    }
    ```

- **POST /playlists/{id}/songs**
  - **Description**: Add a song to a playlist.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "songId": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "message": "Song added to playlist"
    }
    ```

### Collaborations

- **POST /collaborations**
  - **Description**: Add a collaborator to a playlist.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "playlistId": "string",
      "userId": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "data": {
        "collaborationId": "string"
      }
    }
    ```

### Export Playlists

- **POST /export/playlists/{id}**
  - **Description**: Export a playlist as JSON and send it via email using RabbitMQ and nodemailer.
  - **Headers**: `Authorization: Bearer <accessToken>`
  - **Request Body**:
    ```json
    {
      "targetEmail": "string"
    }
    ```
  - **Response** (201 Created):
    ```json
    {
      "status": "success",
      "message": "Playlist export request queued"
    }
    ```
  - **Note**: Ensure the OpenMusic Queue Consumer is running to process the export. The exported playlist is sent as JSON, e.g.:
    ```json
    {
      "playlist": {
        "id": "playlist-123",
        "name": "My Playlist",
        "songs": [
          {
            "id": "song-123",
            "title": "Song Title",
            "performer": "Artist"
          }
        ]
      }
    }
    ```

## Error Handling

The API returns standard HTTP status codes with JSON responses:

- **400 Bad Request**: Invalid request payload or parameters.
  ```json
  {
    "status": "fail",
    "message": "Invalid request payload"
  }
  ```
- **401 Unauthorized**: Missing or invalid authentication token.
  ```json
  {
    "status": "fail",
    "message": "Invalid token"
  }
  ```
- **404 Not Found**: Resource not found.
  ```json
  {
    "status": "fail",
    "message": "Resource not found"
  }
  ```
- **500 Internal Server Error**: Server-side error.
  ```json
  {
    "status": "error",
    "message": "Internal server error"
  }
  ```

## Technologies Used

- **Node.js**: Runtime environment
- **Hapi.js**: Web framework
- **PostgreSQL**: Primary database
- **Redis**: Caching layer
- **RabbitMQ**: Message broker for playlist exports
- **JWT**: Authentication and authorization
- **Nodemailer**: Email delivery for playlist exports
- **Local Storage**: Album cover uploads (max 512KB, image MIME types only)
