# Camp Rating System

A comprehensive web application for rating and reviewing campsites, built with a three-layer architecture.

## Project Structure

```
├── client/                 # Presentation Layer (Next.js)
├── server/                 # Business Logic Layer (Node.js/Express)
└── database/              # Data Access Layer (PostgreSQL)
```

## Features

- User authentication and authorization
- Role-based access control (Admin/Regular User)
- Campsite listing and details
- Review and rating system
- User profile management

## Technology Stack

### Frontend (Presentation Layer)
- Next.js
- React
- Tailwind CSS
- TypeScript

### Backend (Business Logic Layer)
- Node.js
- Express
- TypeScript

### Database (Data Access Layer)
- PostgreSQL
- Prisma ORM

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Configure database connection and other necessary variables

4. Start the development servers:
   ```bash
   # Start client
   cd client
   npm run dev

   # Start server
   cd ../server
   npm run dev
   ```

## Database Schema

### Users
- id (PK)
- username
- email
- password_hash
- role_id (FK)
- created_at
- updated_at

### Roles
- id (PK)
- name
- permissions

### Campsites
- id (PK)
- name
- location
- description
- amenities
- created_at
- updated_at

### Reviews
- id (PK)
- user_id (FK)
- campsite_id (FK)
- rating
- comment
- created_at
- updated_at

## API Documentation

[API documentation will be added here]

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 