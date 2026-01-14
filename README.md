# TETRA_APP

TETRA is a Learning Platform specifically architected for cybersecurity awareness and training. The platform enables organizations to deliver interactive training modules, track user progress through gamified stats, and manage secure content authoring.

## Demo

[![Watch the Demo](https://img.youtube.com/vi/C979ng7IFpA/0.jpg)](https://youtu.be/C979ng7IFpA)

> Click the image above to watch the walkthrough on YouTube.

## Tech Stack

- **Backend:** Java 24 (Stable) with Spring Boot 3.4.5.
- **Frontend:** React 19, TypeScript 5.8, and Vite.
- **Database:** PostgreSQL with JPA/Hibernate for persistence.
- **Security:** JWT-based authentication with a custom Automated Token Blacklisting system for secure logout.
- **State & UI:** TailwindCSS 4.1, Lucide icons, and Chart.js for real-time analytics.

## Key Features

- **Advanced Content Authoring:** Integrated Lexical rich-text editor allowing admins to create complex training modules with embedded media.
- **Progress Tracking:** Custom logic to track completion at the content, unit, and module levels.
- **Security-First Architecture:** Implements Aspect-Oriented Programming (AOP) to log sensitive admin actions and a scheduled cleanup for expired security tokens.
- **Real-time Analytics:** Interactive dashboards for both users and admins to visualize learning paths and completion rates.
- **Automated DevOps:** Fully containerized with Docker and a multi-stage GitLab CI/CD pipeline for automated testing and deployment.
