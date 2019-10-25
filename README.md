# Social Story API

Social Story API that allows authetnicated users to create, read, update, and destroy Social Stories.


# Deployed Repos and Sites
Backend Repo:
https://github.com/sarahzawatsky/capstone-backend

Backend Site:
http://vast-ridge-48751.herokuapp.com/

Frontend Repo:
https://github.com/sarahzawatsky/social-story

Frontend Site:
https://sarahzawatsky.github.io/social-story/#/

# Technologies Used
- express
- MongoDB
- Mongoose
- AWS

# Unsolved Problems
- Chapters should be organized into stories:
  - User has many stories.  Stories have many chapters.  At this time the user actually only has one resource for chapters.
- Create a story.
- Edit a story title.
- Delete a story.
- Ability to browse and favorite community gallery of stories.


# Planning, Process, and Problem-Solving
I started by building the backend for a one-to-many relationship between one user having many chapters. From there, I worked on combining a form with images (multipart/form data and AWS).

# Setup and Installation Instructions
1. Fork and clone.
2. Install dependencies by running `npm install` (see package.json)
3. Run `npm run server` to launch server.

# Entity relationship Diagram
![ERD](https://i.imgur.com/KUP4dJS.jpg)

# Routes
| User Routes      | User Methods |   | Upload Routes | Upload Methods |
|------------------|--------------|---|---------------|----------------|
| /sign-up         | POST         |   | /stories      | GET            |
| /sign-in         | POST         |   | /stories/:id  | GET            |
| /change-password | PATCH        |   | /stories      | POST           |
| /sign-out        | DELETE       |   | /stories/:id  | PATCH          |
|                  |              |   | /stories/:id  | DELETE         |
