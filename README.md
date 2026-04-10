<<<<<<< HEAD
# Khier – Charity Management System

## 📌 Overview

Khier is a backend system designed to help charity organizations manage and track cases (beneficiaries), their families, and the aids provided to them in an organized and efficient way.

The system focuses on simplifying data management, improving tracking, and supporting better decision-making for charitable activities.

---

## 🚀 Features

* 🧾 Case Management (Create, Update, Delete, View)
* 👨‍👩‍👧 Family Members Management
* 🏠 Housing Information Tracking
* 🎁 Aid Management (financial & non-financial support)
* 📊 Income & Expense Tracking
* 📞 Multiple Phone Numbers per Case
* 🖼 Image Upload (Cloudinary Integration)
* 🔐 Authentication System (Custom / JWT Ready)
* 🧠 Clean Architecture & Scalable Design

---

## 🏗 Tech Stack

* Backend: ASP.NET Core Web API
* Database: SQL Server
* ORM: Entity Framework Core
* Architecture: Repository + Unit of Work
* File Storage: Cloudinary

---

## 🔗 Core Entities

* CaseEntity (Beneficiary)
* Families (Family Members)
* House
* Aid
* Income / Spend
* Images
* Phones
* User

---

## ⚙️ Key Concepts

* One-to-Many & One-to-One Relationships
* Data Validation (Fluent API & Constraints)
* Audit Fields (CreatedAt, UpdatedAt)
* Image Handling via Cloud Services
* Modular Configuration using Fluent API

---

## 📦 API Highlights

* Authentication (Login)
* Case CRUD operations
* Add Family Members
* Upload Images
* Manage Aids & Financial Data

---

## 🎯 هدف المشروع

To provide a simple, efficient, and scalable solution for managing charity operations and helping organizations better serve people in need.

---

## 📌 Future Improvements

* Role-based Authorization
* Dashboard & Analytics
* Notification System
* Mobile App Integration

---

## 👨‍💻 Author

Developed by Ahmed Hofny

=======
# KhierFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
>>>>>>> e967856 (first gen)
