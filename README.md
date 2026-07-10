# 🚀 Personal Hub Full Stack

A modern full-stack web application to organize and manage your favorite websites in one place.

Users can create an account, log in securely, organize quick links into categories, customize their profile, and manage everything from a clean dashboard.

---

## ✨ Features

- 🔐 JWT Authentication (Login/Register)
- 👤 User Profile
- 🔗 Add, Edit, Delete Quick Links
- 📂 Categories
- ⭐ Favorites
- 🔄 Drag & Drop Link Sorting
- 📱 Responsive Dashboard
- 🎨 Modern UI
- 🖼 Profile Image Upload

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Django
- Django REST Framework
- JWT Authentication
- MySQL

---

## 📁 Project Structure

```
PersonalHub-FullStack/
│
├── backend/
│   ├── hub/
│   ├── personalhub/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙ Installation

### Clone

```bash
git clone https://github.com/jabir-n/PersonalHub-FullStack.git
```

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 🔒 Environment Variables

Create a `.env` file inside the backend folder.

```
SECRET_KEY=your_secret_key

DEBUG=True

DB_NAME=your_database

DB_USER=your_username

DB_PASSWORD=your_password

DB_HOST=localhost

DB_PORT=3306
```

---

## 📌 Future Improvements

- Dark/Light Theme
- Link Analytics
- Search & Filter
- Folder Management
- Cloud Deployment
- Social Login

---

## 👨‍💻 Author

**Mohammed Jabir**

GitHub:
https://github.com/jabir-n