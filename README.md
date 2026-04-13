📚 Library Management System
📖 About the Project

This project is a Library Management System website developed using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.
The main goal of this system is to help manage library activities such as storing book records, managing student details, issuing books, returning books, calculating fines automatically, and generating student history reports in PDF format.

This project was created as part of a DBMS academic project to demonstrate database integration with a real working website interface.

🎯 Objectives of the Project

The purpose of this project is to:

manage book records efficiently
manage student information digitally
track issued and returned books
calculate overdue fines automatically
generate student borrowing history reports
provide real-time dashboard statistics
implement database connectivity using MySQL
demonstrate CRUD operations using a web interface
🌐 Features of the System
🔐 Login System

The system includes an admin login page where only authorized users can access the dashboard and manage library data.

Default login:

Email: admin@library.com

Password: admin123

📊 Dashboard

The dashboard shows important library statistics such as:

total number of books
total number of students
currently issued books
pending fines

These values are fetched directly from the MySQL database.

📚 Book Management

The system allows the administrator to:

add new books
update book details
delete books
view available quantity of books

All operations are stored in the database.

👨‍🎓 Student Management

The administrator can:

add student details
update student information
delete student records
export student borrowing history as PDF
📖 Assign Book Feature

This feature allows books to be issued to students by selecting:

student name
book name
due date

The system automatically updates available book quantity after issuing.

🔁 Return Book Feature

When a book is returned:

return date is stored
availability is updated
overdue fine is calculated automatically
📄 PDF Report Generation

The system can generate a PDF file containing:

student details
issued books
due dates
return status
fine amount

This helps maintain proper borrowing history records.

🏗️ Technologies Used

Frontend:

HTML
CSS
JavaScript

Backend:

Node.js
Express.js

Database:

MySQL

Libraries Used:

bcrypt (password encryption)
JWT (authentication)
jsPDF (PDF generation)

Tools Used:

VS Code
MySQL Workbench
Live Server Extension
GitHub
📂 Project Folder Structure
library-management-system

backend
 ├── config
 ├── middleware
 ├── routes
 ├── server.js
 └── package.json

frontend
 ├── pages
 ├── css
 └── js

database
 └── schema.sql
⚙️ How to Run the Project

Follow these steps:

Step 1

Open the project in VS Code

Step 2

Start backend server

cd backend
npm run dev

Backend will start on:

http://localhost:5000
Step 3

Open frontend

Go to:

frontend/pages/login.html

Right click → Open with Live Server

Step 4

Login using:

Email: admin@library.com

Password: admin123

🗄️ Database Used

MySQL database named:

library_db

Tables included:

admins
books
students
issues
fines

These tables help manage all library operations efficiently.

🔄 Operations Supported in This System

The system supports CRUD operations:

Create → add books and students
Read → view records
Update → modify records
Delete → remove records

All operations are connected to MySQL database.

📊 Dashboard Visualization

The dashboard displays live statistics including:

total books
total students
issued books
pending fines

These values update automatically whenever database changes.

🚀 Future Improvements

This system can be extended further by adding:

role-based login (admin and student)
email notification for due dates
barcode-based book issuing system
cloud database integration
mobile responsive interface
👩‍💻 Developed By

Madhura Patil
Computer Engineering Student

This project was developed as part of DBMS coursework to demonstrate database-driven web application development.

📘 Project Type

Academic Mini Project
Database Management System (DBMS) Lab Project
