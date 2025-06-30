# OpenMusic Consumer Documentation

## Overview

The `openmusic-consumer` is a Node.js-based consumer application designed to process messages from a RabbitMQ message broker, specifically for handling playlist export functionalities of the OpenMusic API. This consumer listens for messages containing playlist data, processes them, and sends the exported playlist as a JSON file via email using Nodemailer. The application is part of the OpenMusic ecosystem, which provides a RESTful API for music playlist management built with Hapi.js, PostgreSQL, Redis, and RabbitMQ.

## Features

- **Message Consumption**: Listens to a RabbitMQ queue for playlist export requests.
- **JSON Export**: Converts playlist data into JSON format for export.
- **Email Delivery**: Sends the exported playlist JSON via email using Nodemailer.
- **Environment-Based Configuration**: Uses environment variables for sensitive credentials and SMTP settings to ensure security and flexibility.

## Prerequisites

To run the `openmusic-consumer` application, ensure the following are installed:

- **Node.js**: Version 14.x or higher.
- **Docker**: Latest stable version to run Redis and RabbitMQ services.
- **SMTP Server**: An accessible SMTP server (e.g., Gmail, SendGrid) for email delivery.
- **Environment Variables**:
  - `MAIL_ADDRESS`: The email address used to send the exported playlist.
  - `MAIL_PASSWORD`: The password or app-specific password for the email account.
  - `MAIL_HOST`: The SMTP server host (e.g., `smtp.gmail.com`).
  - `MAIL_PORT`: The SMTP server port (e.g., `587` for TLS).
  - `RABBITMQ_SERVER`: The RabbitMQ server URL (e.g., `amqp://rabbitmq:5672` when using Docker).
  - `REDIS_SERVER`: The Redis server host (e.g., `redis:6379` when using Docker).

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ftthreign/openMusic-api-js.git
   cd openMusic-api-js/openmusic-consumer
   ```
2. **Install Dependencies**:

   ```bash
   npm install
   ```

   This installs required Node.js packages, including `amqplib` (for RabbitMQ), `nodemailer`, and `redis`.

3. **Set Up Docker for Redis and RabbitMQ**:

   - Create a `docker-compose.yml` file in the `openmusic-consumer` directory to define Redis and RabbitMQ services:
     ```yaml
     version: "3.8"
     services:
       rabbitmq:
         image: rabbitmq:3.9.4-management
         ports:
           - "5672:5672"
           - "15672:15672"
         environment:
           - RABBITMQ_DEFAULT_USER=guest
           - RABBITMQ_DEFAULT_PASS=guest
         networks:
           - openmusic-network
       redis:
         image: redis:7.0
         ports:
           - "6379:6379"
         networks:
           - openmusic-network
     networks:
       openmusic-network:
         driver: bridge
     ```
   - Run the Docker services:
     ```bash
     docker-compose up -d
     ```
     This starts RabbitMQ (accessible at `amqp://localhost:5672` and management UI at `http://localhost:15672`) and Redis (accessible at `localhost:6379`).

4. **Configure Environment Variables**:
   - Create a `.env` file in the `openmusic-consumer` directory.
   - Add the following environment variables:
     ```env
     MAIL_ADDRESS=your-email@example.com
     MAIL_PASSWORD=your-email-password
     MAIL_HOST=smtp.example.com
     MAIL_PORT=587
     RABBITMQ_SERVER=amqp://guest:guest@rabbitmq:5672
     REDIS_SERVER=redis:6379
     ```
   - Replace email-related values with your SMTP server details. The `RABBITMQ_SERVER` and `REDIS_SERVER` values assume the Docker service names (`rabbitmq` and `redis`) are used within the same Docker network.

## Usage

1. **Run the Consumer**:
   Start the consumer to listen for messages on the RabbitMQ queue:

   ```bash
   npm start
   ```

   The consumer will connect to the RabbitMQ server at `amqp://guest:guest@rabbitmq:5672` and Redis at `redis:6379`, listen to the configured queue (e.g., `export:playlist`), and process incoming messages. Ensure the Docker services are running before starting the consumer.

2. **Message Processing**:

   - The consumer expects messages in a JSON format containing playlist data, such as:
     ```json
     {
       "playlist": {
         "id": "playlist-Mk8AnmCp210PwT6B",
         "name": "My Favorite Coldplay Song",
         "songs": [
           {
             "id": "song-Qbax5Oy7L8WKf74l",
             "title": "Life in Technicolor",
             "performer": "Coldplay"
           },
           {
             "id": "song-poax5Oy7L8WKllqw",
             "title": "Centimeteries of London",
             "performer": "Coldplay"
           },
           {
             "id": "song-Qalokam7L8WKf74l",
             "title": "Lost!",
             "performer": "Coldplay"
           }
         ]
       }
     }
     ```
   - Upon receiving a message, the consumer generates a JSON file from the playlist data.

3. **Email Delivery**:
   - The JSON file is attached to an email and sent to the specified recipient using the configured SMTP server.
   - The email includes the playlist data as an attachment (e.g., `playlist.json`).

## Configuration Details

- **RabbitMQ Queue**:
  - The consumer listens to a queue named `export:playlist` (configurable via code or environment variables).
  - Ensure the OpenMusic API producer sends messages to this queue.
  - Access the RabbitMQ management UI at `http://localhost:15672` (default credentials: `guest`/`guest`) to monitor queues.
- **Redis Configuration**:
  - Used for caching or session management (if applicable in the OpenMusic API).
  - Connects to Redis at `redis:6379` within the Docker network.
- **Email Configuration**:
  - Uses Nodemailer for email delivery.
  - SMTP credentials (`MAIL_ADDRESS`, `MAIL_PASSWORD`, `MAIL_HOST`, `MAIL_PORT`) must be set in the `.env` file.
  - Example for Gmail:
    ```env
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_ADDRESS=your-email@gmail.com
    MAIL_PASSWORD=your-app-specific-password
    ```
- **File Output**:
  - The exported JSON file is temporarily stored locally before being attached to the email.
  - Ensure the application has write permissions in the working directory.

## Error Handling

- **RabbitMQ Connection Errors**: The consumer will retry connecting to RabbitMQ if the initial connection fails. Verify the Docker RabbitMQ service is running.
- **Redis Connection Errors**: Logs errors if Redis is unreachable. Check the Docker Redis service status.
- **Email Delivery Failures**: Logs errors if the SMTP server is unreachable or credentials are invalid.
- **Invalid Message Format**: Skips messages that do not conform to the expected JSON structure.

## Development

- **Dependencies**:
  - `amqplib`: For RabbitMQ message queue interactions.
  - `nodemailer`: For sending emails with playlist data.
  - `redis`: For Redis client interactions.
  - `dotenv`: For loading environment variables.
- **Code Structure**:
  - `index.js`: Main entry point for the consumer, handling RabbitMQ and Redis connections and message processing.
  - `emailService.js`: Handles email sending logic using Nodemailer.
  - `queueService.js`: Manages RabbitMQ queue interactions.
  - `redisService.js`: Manages Redis interactions (if applicable).
- **Extending the Consumer**:
  - Add support for additional queue types for other export formats.
  - Enhance email templates for better user experience.
  - Implement logging to a file or external service for monitoring.

## Testing

- **Unit Tests**:
  - Use a testing framework like `Jest` to test queue processing, Redis interactions, and email sending logic.
  - Mock RabbitMQ, Redis, and SMTP servers for isolated testing.
- **Integration Tests**:
  - Test with Dockerized RabbitMQ and Redis instances and a test SMTP server (e.g., MailHog).
  - Verify that playlists are correctly exported and emailed.

## Troubleshooting

- **RabbitMQ Connection Issues**:
  - Ensure the RabbitMQ Docker service is running (`docker ps`) and accessible at `amqp://rabbitmq:5672`.
  - Check network permissions if using a remote RabbitMQ server.
  - Verify the `RABBITMQ_SERVER` environment variable matches the Docker service configuration.
- **Redis Connection Issues**:
  - Ensure the Redis Docker service is running and accessible at `redis:6379`.
  - Check the `REDIS_SERVER` environment variable.
- **Email Not Sending**:
  - Verify SMTP credentials and server details in the `.env` file.
  - For Gmail, ensure "Less secure app access" is enabled or use an app-specific password.
- **No Messages Processed**:
  - Confirm that the OpenMusic API is sending messages to the correct queue (`export:playlist`).
  - Check RabbitMQ management UI (`http://localhost:15672`) for queue status.
- **Docker Issues**:

  - Ensure Docker and Docker Compose are installed and running.
  - Check container logs for errors: `docker-compose logs rabbitmq` or `docker-compose logs redis`.

- RabbitMQ Documentation: https://www.rabbitmq.com/
- Redis Documentation: https://redis.io/
- Nodemailer Documentation: https://nodemailer.com/
- Docker Documentation: https://docs.docker.com/
- OpenMusic API: https://github.com/Ftthreign/openMusic-api-js
