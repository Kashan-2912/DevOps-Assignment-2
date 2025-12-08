# test trigger
 
 # EzyShopper Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User / Browser                              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS EC2 Instance                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    Jenkins Server                             │ │
│  │                   (CI/CD Automation)                          │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              Jenkins Pipeline Stages                    │ │ │
│  │  │  1. Checkout from GitHub                                │ │ │
│  │  │  2. Environment Setup                                   │ │ │
│  │  │  3. Build Application (Docker Compose)                  │ │ │
│  │  │  4. Verify Deployment                                   │ │ │
│  │  │  5. Health Check                                        │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────┬────────────────────────────────────┘ │
│                             │                                       │
│                             │ triggers                              │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Docker Containers (Volume-based)                 │ │
│  │                                                               │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │ │
│  │  │   Frontend     │  │    Backend     │  │    MongoDB     │ │ │
│  │  │   (Node +      │  │  (Node.js +    │  │   (Database)   │ │ │
│  │  │   Nginx)       │◀─┤   Express)     │◀─┤                │ │ │
│  │  │                │  │                │  │                │ │ │
│  │  │  Port: 5174    │  │  Port: 3001    │  │  Port: 27018   │ │ │
│  │  │                │  │                │  │                │ │ │
│  │  │  Volume:       │  │  Volume:       │  │  Volume:       │ │ │
│  │  │  ./frontend    │  │  ./backend     │  │  mongo_data    │ │ │
│  │  └────────────────┘  └────────┬───────┘  └────────────────┘ │ │
│  │                               │                              │ │
│  └───────────────────────────────┼──────────────────────────────┘ │
└───────────────────────────────────┼────────────────────────────────┘
                                    │
                                    │ External Services
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │   MongoDB    │  │    Redis     │  │  Cloudinary  │
         │   Atlas      │  │  (Upstash)   │  │   (Images)   │
         │  (Database)  │  │   (Cache)    │  │              │
         └──────────────┘  └──────────────┘  └──────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │    Stripe    │
                           │  (Payments)  │
                           └──────────────┘
```

## Application Architecture

### Frontend Architecture (React + Vite)

```
frontend/
├── src/
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # Application entry point
│   │
│   ├── pages/                     # Page components (Routes)
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── LoginPage.jsx         # User login
│   │   ├── SignUpPage.jsx        # User registration
│   │   ├── CategoryPage.jsx      # Product category view
│   │   ├── CartPage.jsx          # Shopping cart
│   │   ├── AdminPage.jsx         # Admin dashboard
│   │   ├── PurchaseSuccessPage.jsx
│   │   └── PurchaseCancelPage.jsx
│   │
│   ├── components/                # Reusable components
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ProductCard.jsx       # Product display card
│   │   ├── CartItem.jsx          # Cart item component
│   │   ├── CategoryItem.jsx      # Category display
│   │   ├── FeaturedProducts.jsx  # Featured products section
│   │   ├── CreateProductForm.jsx # Admin product form
│   │   ├── AnalyticsTab.jsx      # Admin analytics
│   │   ├── OrderSummary.jsx      # Order summary
│   │   └── LoadingSpinner.jsx    # Loading indicator
│   │
│   ├── stores/                    # Zustand state management
│   │   ├── useUserStore.js       # User state (auth, profile)
│   │   ├── useProductStore.js    # Product state (catalog)
│   │   └── useCartStore.js       # Cart state (items, total)
│   │
│   └── lib/
│       └── axios.js               # Configured Axios instance
│
└── dist/                          # Build output (production)
```

**State Management Flow:**
```
User Action → Component → Zustand Store → API Call (Axios) → Backend
                ↑                                              ↓
                └──────────── Update State ←───────────────────┘
```

### Backend Architecture (Node.js + Express)

```
backend/
├── server.js                      # Application entry point
│
├── models/                        # Mongoose schemas
│   ├── user.model.js             # User schema (auth, profile)
│   ├── product.model.js          # Product schema
│   ├── order.model.js            # Order schema
│   └── coupon.model.js           # Coupon/discount schema
│
├── controllers/                   # Business logic
│   ├── auth.controller.js        # Authentication logic
│   ├── product.controller.js     # Product CRUD operations
│   ├── cart.controller.js        # Cart management
│   ├── payment.controller.js     # Payment processing (Stripe)
│   ├── coupon.controller.js      # Coupon management
│   └── analytics.controller.js   # Analytics data
│
├── routes/                        # API endpoints
│   ├── auth.route.js             # /api/auth/*
│   ├── product.route.js          # /api/products/*
│   ├── cart.route.js             # /api/cart/*
│   ├── payment.route.js          # /api/payments/*
│   ├── coupon.route.js           # /api/coupons/*
│   └── analytics.route.js        # /api/analytics/*
│
├── middleware/
│   └── auth.middleware.js        # JWT verification, role checks
│
└── lib/                           # Utility modules
    ├── db.js                      # MongoDB connection
    ├── redis.js                   # Redis client setup
    ├── stripe.js                  # Stripe configuration
    └── cloudinary.js              # Cloudinary setup
```

**API Request Flow:**
```
Client Request
    ↓
Express Router
    ↓
Auth Middleware (if protected route)
    ↓
Controller (Business Logic)
    ↓
Model (Database Operations)
    ↓
Response to Client
```

## Data Flow

### Authentication Flow

```
1. User Registration/Login
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │  Client  │────────▶│ Backend  │────────▶│ MongoDB  │
   │          │ POST    │  Auth    │ Create  │          │
   │          │◀────────│Controller│◀────────│          │
   └──────────┘ JWT     └──────────┘ User    └──────────┘

2. Authenticated Request
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │  Client  │────────▶│  Auth    │────────▶│Protected │
   │ +JWT     │ Request │Middleware│ Verify  │ Route    │
   │          │◀────────│          │◀────────│          │
   └──────────┘ Response└──────────┘ Allow   └──────────┘
```

### E-Commerce Flow

```
1. Browse Products
   User → Frontend → API → MongoDB → Products → Display

2. Add to Cart
   User → Cart Store → Local State → Display Cart

3. Checkout
   User → Cart → Backend → Stripe API → Process Payment
                    ↓
                 MongoDB (Save Order)
                    ↓
              Redis (Cache Analytics)
                    ↓
           Frontend (Success Page)
```

## Deployment Architectures

### Part-I: Image-Based Deployment

```
┌─────────────────────────────────────────────┐
│        docker-compose.yml                    │
├─────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Backend Container                     │ │
│  │  Image: kashan2912/ezy-backend:latest  │ │
│  │  Port: 3000 → 3000                     │ │
│  │  Code: Baked into image                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Frontend Container                    │ │
│  │  Image: kashan2912/ezy-frontend:latest │ │
│  │  Port: 80 → 5173                       │ │
│  │  Code: Baked into image                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  MongoDB Container                     │ │
│  │  Image: mongo:6.0                      │ │
│  │  Volume: mongo_data                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Build Process:
Dockerfile → docker build → Docker Image → Docker Hub → docker-compose pull
```

### Part-II: Volume-Based Deployment (Jenkins)

```
┌─────────────────────────────────────────────┐
│     docker-compose-jenkins.yml              │
├─────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Backend Container (Jenkins)           │ │
│  │  Image: node:18-alpine (base)          │ │
│  │  Port: 3000 → 3001                     │ │
│  │  Volume: ./backend → /usr/src/app      │ │
│  │  Command: npm install && node server   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Frontend Container (Jenkins)          │ │
│  │  Image: node:18-alpine (base)          │ │
│  │  Port: 5173 → 5174                     │ │
│  │  Volume: ./frontend → /app             │ │
│  │  Command: npm install && build && serve│ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  MongoDB Container (Jenkins)           │ │
│  │  Image: mongo:6.0                      │ │
│  │  Port: 27017 → 27018                   │ │
│  │  Volume: mongo_data_jenkins            │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Build Process:
GitHub → Jenkins → docker-compose up → Mount volumes → Run commands
```

## Jenkins Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Jenkinsfile                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Environment Variables                                       │
│  ├─ GIT_REPO                                                │
│  ├─ GIT_BRANCH                                              │
│  └─ DOCKERHUB_CREDENTIALS                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stage 1: Checkout                                      │ │
│  │ ─────────────────                                      │ │
│  │ • Clone repository from GitHub                         │ │
│  │ • Checkout specified branch                            │ │
│  │ • Verify code is latest version                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stage 2: Environment Setup                             │ │
│  │ ──────────────────────                                 │ │
│  │ • Check Docker installation                            │ │
│  │ • Check Docker Compose version                         │ │
│  │ • Clean up previous containers                         │ │
│  │ • Prune Docker system                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stage 3: Build Application                             │ │
│  │ ──────────────────────                                 │ │
│  │ • Run docker-compose with jenkins config               │ │
│  │ • Mount source code as volumes                         │ │
│  │ • Start all containers in detached mode                │ │
│  │ • Install dependencies inside containers               │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stage 4: Verify Deployment                             │ │
│  │ ──────────────────────                                 │ │
│  │ • Wait for containers to stabilize (30s)               │ │
│  │ • Check container status (docker ps)                   │ │
│  │ • View container logs                                  │ │
│  │ • Verify all services are running                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stage 5: Health Check                                  │ │
│  │ ─────────────────────                                  │ │
│  │ • Test backend endpoint (curl)                         │ │
│  │ • Test frontend endpoint (curl)                        │ │
│  │ • Verify HTTP 200 responses                            │ │
│  │ • Confirm application is accessible                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Post-Build Actions                                     │ │
│  │ ──────────────────                                     │ │
│  │ SUCCESS:                                               │ │
│  │ • Display success message                              │ │
│  │ • Show application URLs                                │ │
│  │ • (Optional) Send notifications                        │ │
│  │                                                        │ │
│  │ FAILURE:                                               │ │
│  │ • Display error message                                │ │
│  │ • Show container logs                                  │ │
│  │ • Clean up failed containers                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Network Architecture

### Docker Network Configuration

```
┌──────────────────────────────────────────────────────────┐
│           ezyshopper-network (Bridge Driver)             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐                                   │
│  │  Frontend        │                                   │
│  │  Container       │                                   │
│  │  ├─ Internal IP  │                                   │
│  │  └─ Port 5173    │                                   │
│  └────────┬─────────┘                                   │
│           │                                              │
│           │ HTTP Requests                                │
│           ▼                                              │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Backend         │◀────▶│  MongoDB         │        │
│  │  Container       │      │  Container       │        │
│  │  ├─ Internal IP  │      │  ├─ Internal IP  │        │
│  │  └─ Port 3000    │      │  └─ Port 27017   │        │
│  └──────────────────┘      └──────────────────┘        │
│           │                                              │
│           │ External APIs                                │
│           ▼                                              │
│  ┌──────────────────────────────────────────┐          │
│  │ External Services (via Internet)         │          │
│  │ • MongoDB Atlas                          │          │
│  │ • Redis (Upstash)                        │          │
│  │ • Cloudinary                             │          │
│  │ • Stripe                                 │          │
│  └──────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────┘

Host Ports Mapping:
Frontend:  Host 5174 → Container 5173
Backend:   Host 3001 → Container 3000
MongoDB:   Host 27018 → Container 27017
```

## Security Architecture

### Authentication & Authorization

```
1. JWT Token Flow
   ┌─────────┐
   │  User   │
   └────┬────┘
        │ 1. Login Request
        ▼
   ┌─────────────┐
   │  Backend    │
   │  Auth       │
   └────┬────────┘
        │ 2. Verify Credentials (MongoDB)
        │ 3. Generate JWT Tokens
        │    • Access Token (15 min)
        │    • Refresh Token (7 days)
        ▼
   ┌─────────────┐
   │  Client     │
   │  (Cookies)  │
   └─────────────┘

2. Protected Route Access
   ┌─────────┐
   │ Request │
   │ + JWT   │
   └────┬────┘
        │
        ▼
   ┌──────────────┐
   │ Middleware   │
   │ • Verify JWT │
   │ • Check Role │
   └────┬─────────┘
        │
        ├─ Valid ────────▶ Allow Access
        │
        └─ Invalid ──────▶ 401 Unauthorized
```

### Environment Security

```
Secrets Management:
┌─────────────────────────────────────────┐
│  Development:                            │
│  └─ .env file (local, not committed)    │
│                                          │
│  Production (Jenkins):                   │
│  ├─ Jenkins Credentials Store            │
│  ├─ Environment Variables in docker-     │
│  │  compose-jenkins.yml (for demo)      │
│  └─ AWS Secrets Manager (recommended)    │
└─────────────────────────────────────────┘

Protected Data:
• Database credentials
• JWT secrets
• API keys (Stripe, Cloudinary)
• Redis connection strings
```

## Scalability Considerations

### Horizontal Scaling (Future Enhancement)

```
                  ┌──────────────┐
                  │ Load Balancer│
                  │  (Nginx)     │
                  └───────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │Frontend │      │Frontend │      │Frontend │
   │Instance1│      │Instance2│      │Instance3│
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ Load Balancer│
                  └───────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │Backend  │      │Backend  │      │Backend  │
   │Instance1│      │Instance2│      │Instance3│
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   MongoDB    │
                  │   Cluster    │
                  └──────────────┘
```

## Monitoring & Logging

### Logging Architecture (Current)

```
┌──────────────────────────────────────────────┐
│  Container Logs                              │
├──────────────────────────────────────────────┤
│                                              │
│  Frontend: docker logs frontend-jenkins      │
│  Backend:  docker logs backend-jenkins       │
│  MongoDB:  docker logs mongo-jenkins         │
│                                              │
│  Accessible via:                             │
│  • docker logs <container>                   │
│  • docker-compose logs -f                    │
│  • Jenkins console output                    │
└──────────────────────────────────────────────┘
```

## Technology Stack Summary

```
┌────────────────┬──────────────────────────────────┐
│ Layer          │ Technologies                     │
├────────────────┼──────────────────────────────────┤
│ Frontend       │ React 18, Vite, Tailwind CSS     │
│ State Mgmt     │ Zustand                          │
│ Backend        │ Node.js, Express.js              │
│ Database       │ MongoDB (Atlas), Mongoose        │
│ Cache          │ Redis (Upstash)                  │
│ Storage        │ Cloudinary (Images)              │
│ Payments       │ Stripe API                       │
│ Auth           │ JWT (jsonwebtoken)               │
│ Container      │ Docker, Docker Compose           │
│ CI/CD          │ Jenkins, Git                     │
│ Cloud          │ AWS EC2                          │
│ Version Control│ Git, GitHub                      │
└────────────────┴──────────────────────────────────┘
```

---

*This architecture is designed for educational purposes and demonstrates CI/CD best practices with Jenkins and Docker.*

