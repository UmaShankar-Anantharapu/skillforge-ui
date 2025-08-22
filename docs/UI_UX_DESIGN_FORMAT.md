# UI/UX Design Format Guide

This document outlines a standardized format for detailing UI/UX designs for the SkillForge platform. This structure aims to provide clarity and consistency in design documentation.

## 1. Screen Name

*   **Description:** A clear, concise name for the screen being designed (e.g., "Homepage," "Roadmap Generation," "Roadmap Detail").

## 2. Purpose

*   **Description:** Briefly explain the primary goal and function of this screen within the application. What problem does it solve for the user?

## 3. Key Features/Functionality

*   **Description:** List the main features and functionalities available on this screen. What can the user do here?
    *   Example: User can generate a new learning roadmap.
    *   Example: User can view their current learning progress.

## 4. Layout/Structure

*   **Description:** Describe the overall layout of the screen, including major sections and their arrangement.
    *   **Header:** (e.g., Logo, Navigation, User Profile Icon)
    *   **Sidebar:** (e.g., Main Menu, Quick Links)
    *   **Main Content Area:** (e.g., Dashboard widgets, Form fields, List display)
    *   **Footer:** (e.g., Copyright, Links)

## 5. Components

*   **Description:** List the key UI components used on this screen and their purpose.
    *   **Buttons:** (e.g., "Generate Roadmap" button, "Mark as Complete" button)
    *   **Input Fields:** (e.g., Text input for topic, Dropdown for level)
    *   **Cards:** (e.g., "My Progress" card, "Recommended Roadmap" card)
    *   **Navigation Elements:** (e.g., Tabs, Breadcrumbs)
    *   **Progress Indicators:** (e.g., Progress bars, Spinners)

## 6. User Flow

*   **Description:** Provide a brief narrative or step-by-step description of how a user would interact with this screen to achieve a specific goal.
    *   Example: User navigates to Roadmap Generation -> Enters topic and preferences -> Clicks "Generate" -> Views generated roadmap.

## 7. Mockup/Wireframe (Conceptual)

*   **Description:** A textual description of the visual layout or a placeholder for a visual representation (e.g., a link to a Figma/Whimsical design).
    *   *Placeholder for visual mockup/wireframe*

## 8. API Endpoints Used

*   **Description:** List the specific backend API endpoints that this frontend screen interacts with.
    *   **GET:** `/api/research/status`
    *   **POST:** `/api/research/roadmap`
    *   **GET:** `/api/research/search`
    *   **POST:** `/api/research/scrape`
    *   **POST:** `/api/research/analyze-topic`
    *   **POST:** `/api/research/compare-resources`