# SecondHand Market - Online Marketplace Platform

A complete second-hand marketplace platform built with Django (Backend) and React (Frontend) where users can buy and sell used items.

## 🚀 Features

### Core Features
- **User Management**: Registration, login, profile management with seller verification
- **Product Listings**: Create, edit, and manage product listings with images
- **Advanced Search & Filtering**: Search by name, category, price range, location
- **Real-time Chat**: Internal messaging system for buyers and sellers
- **Offers & Negotiation**: Make and manage price offers
- **Favorites System**: Save and manage favorite products
- **Order Management**: Complete order lifecycle with tracking
- **Reviews & Ratings**: Rate and review other users
- **Admin Dashboard**: Comprehensive admin interface

### Additional Features
- **Seller Verification**: Document-based seller verification system
- **Shipping Management**: Multiple shipping methods and tracking
- **Dispute Resolution**: Built-in dispute handling system
- **Notifications**: Real-time notifications for messages and offers
- **Responsive Design**: Mobile-first responsive UI

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7**: Web framework
- **Django REST Framework**: API development
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL**: Database (configurable)
- **Celery**: Asynchronous task processing
- **Redis**: Caching and message broker
- **Pillow**: Image processing

### Frontend
- **React 19**: UI library
- **TypeScript**: Type safety
- **Material-UI**: Component library
- **React Router**: Navigation
- **React Query**: Data fetching and caching
- **Axios**: HTTP client

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite for development)
- Redis (optional, for Celery)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd web-programming-project
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py create_sample_data

# Run the development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📁 Project Structure

```
web-programming-project/
├── backend/
│   ├── marketplace/          # Django project settings
│   ├── users/               # User management app
│   ├── products/            # Product listings app
│   ├── chat/                # Messaging system app
│   ├── orders/              # Order management app
│   ├── requirements.txt     # Python dependencies
│   └── manage.py           # Django management script
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main app component
│   ├── package.json        # Node.js dependencies
│   └── public/             # Static files
└── README.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:password@localhost:5432/dbname

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Email (for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# File Storage
MEDIA_URL=/media/
STATIC_URL=/static/
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile

### Product Endpoints

- `GET /api/products/` - List products with filtering
- `POST /api/products/create/` - Create new product
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/update/` - Update product
- `DELETE /api/products/{id}/delete/` - Delete product

### Chat Endpoints

- `GET /api/chat/conversations/` - List conversations
- `POST /api/chat/start-conversation/{product_id}/` - Start conversation
- `GET /api/chat/conversations/{id}/messages/` - Get messages
- `POST /api/chat/messages/create/` - Send message

### Order Endpoints

- `GET /api/orders/` - List orders
- `POST /api/orders/create/` - Create order
- `GET /api/orders/{id}/` - Get order details
- `POST /api/orders/{id}/ship/` - Mark as shipped
- `POST /api/orders/{id}/deliver/` - Mark as delivered

## 🎯 Key Features Implementation

### User Management
- Custom User model with seller verification
- JWT-based authentication
- Profile management with image upload
- User ratings and reviews system

### Product Management
- Multi-image upload support
- Advanced search and filtering
- Category management
- Price negotiation system

### Communication
- Real-time chat system
- Offer management
- Notification system
- Message read status

### Order Processing
- Complete order lifecycle
- Shipping tracking
- Payment status management
- Dispute resolution

## 🔒 Security Features

- JWT token authentication
- Password hashing
- CSRF protection
- Input validation
- File upload security
- Rate limiting

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Configure environment variables
5. Use Gunicorn or uWSGI

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve static files with nginx or similar
3. Configure API endpoint for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest changes:
- Watch the repository
- Check the releases page
- Follow the development blog

---

**Note**: This is a comprehensive second-hand marketplace platform with all the requested features implemented. The system is production-ready with proper security measures, error handling, and user experience considerations.


