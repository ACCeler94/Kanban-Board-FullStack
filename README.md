# Kanban Board

A production-ready full-stack Kanban board application built with **React**, **Express**, and **MySQL**, written entirely in **TypeScript**. The frontend features a modern UI powered by **MUI**, while the backend handles **authentication via Auth0**, RESTful APIs with Express, and data persistence using **Prisma** with a MySQL database.

Design inspired by [Frontend Mentor – Kanban Challenge](https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB).

**🔗 Live App:** [kanban-board-fullstack.onrender.com](https://kanban-board-fullstack.onrender.com)

---

## ✨ Features

- ✅ Auth0 authentication with secure session handling
- 🗂️ Create, edit, and delete boards and tasks
- ✅ Subtasks support for better task breakdown
- 🔄 Drag & Drop to change task status (via DnD-Kit)
- 👥 Assign users to tasks
- 🔒 Access control: Only board members can view and manage its content
- 📱 Responsive and accessible UI

---

## 🛠️ Tech Stack

**Frontend:**

- React (with Vite)
- Zustand (state management)
- React Query (data fetching & caching)
- MUI (Material UI)
- DnD-Kit (drag and drop)


**Backend:**

- Node.js with Express
- Prisma ORM
- MySQL (Aiven-hosted)
- Auth0 for authentication
- Redis (session storage)
- Zod (data validation)

**Testing & Dev Tools:**

- Vitest
- TypeScript (frontend & backend)
- Docker