# Spill – Split the Bill 💸

**Spill** is a full-stack expense-sharing web application designed to make splitting bills between friends, roommates, and groups simple and transparent.

Create groups, record shared expenses, split bills among selected members, track individual balances, and manage payments with a confirmation system.

The goal is simple: **Money shouldn't complicate friendships.**

---

## ✨ Features

### 🔐 Authentication
- User registration and login.
- Secure password hashing using BCrypt.
- JWT-based authentication.
- Protected routes and authenticated API endpoints.

### 👥 Group Management
- Create groups with automatically generated unique invite codes.
- Join existing groups using invite codes.
- Multiple groups per user.
- Group admin and member roles.
- View group details and member information.

### 💰 Expense Management
- Add expenses to groups.
- Select who paid for an expense.
- Choose specific members to participate in an expense.
- Equal expense splitting.
- Custom expense splitting.
- Automatic calculation of individual shares.
- View expense history.

### 📊 Balance Management
- Track how much each member has paid.
- Calculate individual expense shares.
- View net balances.
- Identify who owes money and who should receive money.

### 🤝 Smart Settlement System
- Generate optimized settlement suggestions using group-wide net balances.
- Minimize unnecessary transactions between members.
- Record payment requests.
- Allow receivers to confirm or reject payment requests.
- Maintain settlement history.
- Update balances only after payment confirmation.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Lucide React
- Vite

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- JWT Authentication
- Lombok

### Database
- PostgreSQL

### Development Tools
- Visual Studio Code
- Eclipse IDE
- Postman
- Git & GitHub

---

## 📁 Project Structure

```text
Spill/
│
├── .gitignore
│
├── frontend-development/
│   │
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── GroupList.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── OverviewCards.jsx
│   │   │   │   ├── RecentActivity.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   │
│   │   │   ├── group/
│   │   │   │   └── AddExpenseModal.jsx
│   │   │   │
│   │   │   ├── Left.jsx
│   │   │   ├── Right.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── GroupDetails.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── groupService.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend-development/
│   │
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/spill/backend/
│   │   │   │   │
│   │   │   │   ├── config/
│   │   │   │   │   ├── JwtConfig.java
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   │
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ExpenseController.java
│   │   │   │   │   ├── GroupController.java
│   │   │   │   │   └── SettlementController.java
│   │   │   │   │
│   │   │   │   ├── dto/
│   │   │   │   │   └── Request and Response DTOs
│   │   │   │   │
│   │   │   │   ├── exception/
│   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   │
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Group.java
│   │   │   │   │   ├── GroupMember.java
│   │   │   │   │   ├── Expense.java
│   │   │   │   │   ├── ExpenseSplit.java
│   │   │   │   │   ├── Settlement.java
│   │   │   │   │   └── SettlementStatus.java
│   │   │   │   │
│   │   │   │   ├── repository/
│   │   │   │   │   └── JPA Repository interfaces
│   │   │   │   │
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── JwtService.java
│   │   │   │   │   ├── GroupService.java
│   │   │   │   │   ├── ExpenseService.java
│   │   │   │   │   └── SettlementService.java
│   │   │   │   │
│   │   │   │   └── SpillBackendApplication.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application.example.properties
│   │   │
│   │   └── test/
│   │       └── java/
│   │
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run Spill locally.

### 1. Prerequisites

Make sure you have installed:

- Java Development Kit (JDK)
- Node.js and npm
- PostgreSQL
- Git
- Maven (optional, since the project includes Maven Wrapper)

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Spill.git

cd Spill
```

### 3. Database Configuration

Create a PostgreSQL database:

```sql
CREATE DATABASE spill_db;
```

Configure the following environment variables on your system:

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Secret key used for JWT signing |

Example database URL:

```text
jdbc:postgresql://localhost:5432/spill_db
```

**Important:** Never commit actual database credentials or JWT secrets to GitHub.

The backend uses environment variables through `application.properties`.

### 4. Run the Backend

Navigate to the backend directory:

```bash
cd backend-development
```

Run using Maven Wrapper on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Or use:

```bash
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend-development
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🔄 Application Workflow

1. Register or log in to your Spill account.
2. Create a group or join an existing group using an invite code.
3. Add expenses and select the participating members.
4. Choose equal or custom splitting.
5. View individual balances and optimized settlement suggestions.
6. Record a payment request.
7. The receiver confirms or rejects the payment.
8. Confirmed payments update the group balances.

---

## 🔒 Security

- Passwords are stored using BCrypt hashing.
- JWT tokens are used for authentication.
- Protected backend endpoints require authentication.
- Sensitive configuration is kept outside the Git repository.
- Environment variables are used for database credentials and JWT secrets.

---

## 🚀 Future Improvements

- Real-time group notifications.
- Expense editing and additional expense management.
- Payment gateway integration.
- Email notifications.
- Expense analytics and visual reports.
- Mobile-responsive enhancements.
- Deployment with cloud-hosted database infrastructure.

---

## 👨‍💻 Author

**Tarang Raj Gupta**

B.Tech CSE (Data Science)

Haldia Institute of Technology

- GitHub: [Tarang-RG](https://github.com/Tarang-RG)
- LinkedIn: [Tarang Raj Gupta](https://www.linkedin.com/in/tarang-raj-gupta-45a67b361/)

---

## 📄 License

This project is currently developed as a personal learning and development project.

---

**Spill – Split the Bill. Keep the friendships.** 💚
