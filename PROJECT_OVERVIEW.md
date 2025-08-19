# Killigraphy Project Overview

Killigraphy is a modern social media web application designed for creative collaboration and social engagement. The project features a React frontend with TypeScript and a Node.js backend, implementing advanced patterns and real-time communication.

## Technologies & Techniques Used

### Frontend (React + TypeScript)

#### **AuthContext - Global State Management**
Implements centralized authentication state using React Context API for secure user session management:

```tsx
const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthUser = async () => {
        try {
            setIsLoading(true);
            const currentUser = await getCurrentUser();
            
            if (currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('checkAuthUser failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Check auth on page reload
    useEffect(() => {
        checkAuthUser();
    }, []);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**How it works**: 
- Provides global authentication state across all components
- Automatically checks user authentication on app load
- Manages loading states during auth operations
- Used via `useUserContext()` hook throughout the application

#### **Custom Hooks - Reusable Logic**

**useDebounce Hook** - Optimizes search and input performance:
```tsx
function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
```

**How it works**: 
- Delays API calls until user stops typing for 500ms
- Prevents excessive network requests during search
- Used in search components to optimize performance

#### **React Query (@tanstack/react-query) - Server State Management**
Handles data fetching, caching, and synchronization:

```tsx
// Example query for fetching posts
export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    });
};

// Example mutation for creating posts
export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        },
    });
};
```

**How it works**:
- Automatically caches API responses to reduce network requests
- Provides loading, error, and success states
- Invalidates and refetches data when mutations occur
- Implements infinite scrolling with `useInfiniteQuery`

#### **Tech Stack Dependencies**:
- **React 19** + **TypeScript** for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** + **Radix UI** for modern, accessible UI components
- **React Hook Form** + **Zod** for type-safe form validation
- **Socket.IO Client** for real-time communication
- **React Router DOM** for client-side routing

### Backend (Node.js + TypeScript)

#### **Layered Architecture with Design Patterns**

**Factory Pattern** - Object creation abstraction:
```tsx
export class UserFactory implements IUserFactory {
    async create(input: RegisterUserInput): Promise<Partial<UserDocument>> {
        const hashedPassword = await hashPassword(input.password);
        return {
            name: input.name,
            username: input.username,
            email: input.email,
            password: hashedPassword,
            imageUrl: 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg',
            accountId: crypto.randomUUID(),
            followers: [],
            following: [],
            likedPosts: [],
        };
    }
}
```

**Repository Pattern** - Data access abstraction:
```tsx
// Clean separation between business logic and data access
export const findUserById = (id: string) =>
    Users.findById(id).select('-password -__v -createdAt -updatedAt');

export const findUsersByIds = (ids: string[]) =>
    Users.find({ _id: { $in: ids } }).select('-password -__v -createdAt -updatedAt');

export const createUser = (data: any) => {
    return Users.create({
        ...data,
        imageUrl: 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg',
    });
};
```

**Strategy Pattern** - Algorithm selection at runtime:
```tsx
// Personalized Feed Strategy Implementation
export class PersonalizedFeedStrategy implements IFeedStrategy {
    async generateFeed(userId: string): Promise<any[]> {
        const user = await User.findById(userId)
            .select('following likedPosts')
            .populate({ path: 'likedPosts', select: 'tags' });

        // Extract liked tags for content-based filtering
        const likedTags = new Set<string>();
        user.likedPosts?.forEach((post: any) => {
            post.tags?.forEach((tag: string) => likedTags.add(tag));
        });

        // Get posts from following + related content
        const [fromFollowing, relatedPosts] = await Promise.all([
            Post.find({ creator: { $in: followingIds } }).sort({ createdAt: -1 }),
            Post.find({
                tags: { $in: Array.from(likedTags) },
                creator: { $nin: [...followingIds, userId] },
            }).sort({ createdAt: -1 })
        ]);

        return this.combineAndRankPosts(fromFollowing, relatedPosts);
    }
}
```

#### **Real-time Communication with Socket.IO**
Advanced socket management with authentication and strategy patterns:

```tsx
export class SocketService {
    private io: Server;
    private socketContext: SocketContext;
    private connectedUsers: Map<string, string> = new Map();

    constructor(server: HTTPServer) {
        this.io = new Server(server, {
            cors: { origin: ['http://localhost:5173'], credentials: true },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.socketContext = new SocketContext();
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware(): void {
        this.io.use((socket: Socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                socket.data.userId = decoded.userId;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            this.connectedUsers.set(socket.data.userId, socket.id);
            
            // Handle all events using strategy pattern
            const events = this.socketContext.getAvailableEvents();
            events.forEach(eventName => {
                socket.on(eventName, async (data: any) => {
                    await this.socketContext.executeStrategy(eventName, socket, this.io, data);
                });
            });
        });
    }
}
```

**How it works**:
- JWT-based socket authentication
- User presence tracking with online/offline status
- Strategy pattern for handling different socket events
- Real-time messaging and notifications

#### **Automated Features**
**Cron Jobs** for background tasks:
```tsx
// Auto-refresh user suggestions every 10 minutes
cron.schedule('*/10 * * * *', () => {
    console.log("Running suggestion refresh job...");
    refreshSuggestionsForAllUsers().catch(console.error);
});
```

#### **Tech Stack Dependencies**:
- **Express.js** + **TypeScript** for type-safe API development
- **MongoDB** + **Mongoose** for document database with ODM
- **Socket.IO** for real-time bidirectional communication
- **Redis** for caching and session management
- **ImageKit** for cloud-based image processing and CDN
- **JWT** for stateless authentication
- **bcryptjs** for password hashing
- **Node-cron** for scheduled background tasks

## Project Architecture & Patterns

### **Monorepo Structure**
```
killigraphy/                 # React frontend
├── src/
│   ├── _auth/              # Authentication pages & forms
│   ├── _root/              # Main app layout & pages
│   ├── components/         # Reusable UI components
│   ├── context/            # Global state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API configurations
│   └── types/              # TypeScript type definitions

killigraphy_back_end/        # Node.js backend
├── src/
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data access layer
│   ├── factories/          # Object creation patterns
│   ├── strategies/         # Algorithm selection patterns
│   ├── models/             # Database schemas
│   ├── routes/             # API route definitions
│   └── middleware/         # Request processing middleware
```

### **Backend Architecture Patterns**

#### **Layered Architecture**
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and orchestrate operations
- **Repositories**: Abstract data access and database queries
- **Models**: Define data structures and validation rules

#### **Factory Pattern Implementation**
```tsx
// Different factories for different entities
├── UserFactory/
│   ├── IUserFactory.ts     # Interface definition
│   └── UserFactory.ts     # Implementation
├── PostFactory/
├── MessageFactory/
└── ChatFactory/
```

#### **Strategy Pattern for Dynamic Behavior**
```tsx
// Feed generation strategies
export class FeedContext {
    private strategy: IFeedStrategy;

    setStrategy(strategy: IFeedStrategy): void {
        this.strategy = strategy;
    }

    async generateFeed(userId: string): Promise<any[]> {
        return this.strategy.generateFeed(userId);
    }
}

// Socket event handling strategies
export class SocketContext {
    private strategies: Map<string, ISocketStrategy> = new Map();

    async executeStrategy(event: string, socket: Socket, io: Server, data: any) {
        const strategy = this.strategies.get(event);
        if (strategy) {
            return strategy.handle(socket, io, data);
        }
    }
}
```

## Key Features & Implementation

### **Authentication System**
- JWT-based stateless authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Context-based auth state management
- Automatic token refresh handling

### **Real-time Communication**
- Socket.IO for bidirectional communication
- User presence tracking (online/offline status)
- Real-time messaging with typing indicators
- Live notifications for likes, comments, follows
- Authenticated socket connections

### **Content Management**
- Image upload with crop functionality
- Cloud storage integration (ImageKit)
- Post creation with rich media support
- Comment system with nested replies
- Like/save functionality with optimistic updates

### **Social Features**
- User following/followers system
- Personalized content feed algorithm
- User discovery and suggestions
- Profile management with bio/avatar
- Search functionality with debounced queries

### **Performance Optimizations**
- React Query for intelligent caching
- Debounced search inputs
- Infinite scroll pagination
- Image lazy loading
- Background job processing (cron)

## Database Design

### **MongoDB Collections**
```typescript
// User Schema
{
  _id: ObjectId,
  name: string,
  username: string,
  email: string,
  password: string, // hashed
  imageUrl: string,
  bio: string,
  followers: ObjectId[], // User references
  following: ObjectId[], // User references
  likedPosts: ObjectId[] // Post references
}

// Post Schema
{
  _id: ObjectId,
  caption: string,
  imageUrl: string,
  tags: string[],
  location: string,
  creator: ObjectId, // User reference
  likes: ObjectId[], // User references
  createdAt: Date
}

// Message Schema
{
  _id: ObjectId,
  content: string,
  sender: ObjectId, // User reference
  chat: ObjectId, // Chat reference
  messageType: 'text' | 'image' | 'file',
  isRead: boolean,
  createdAt: Date
}
```

## Development Workflow

### **Frontend Development**
```bash
cd killigraphy
npm install
npm run dev          # Development server on port 5173
npm run build        # Production build
npm run lint         # Code linting
```

### **Backend Development**
```bash
cd killigraphy_back_end
npm install
npm run dev          # Development server with hot reload
```

### **Docker Deployment**
```bash
docker-compose up -d # Run both services in containers
```

## API Architecture

### **RESTful Endpoints**
- `POST /api/auth/login` - User authentication
- `GET /api/posts` - Fetch posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/users/:id` - Get user profile
- `POST /api/messages` - Send message
- `GET /api/chats/:userId` - Get user chats

### **WebSocket Events**
- `message_sent` - Real-time message delivery
- `user_online/offline` - Presence updates
- `typing_start/stop` - Typing indicators
- `notification` - Live notifications

## Testing & Quality Assurance

### **API Testing**
- Postman collections for endpoint testing
- Performance testing configurations
- Automated test runners
- Socket connection testing tools

### **Code Quality**
- ESLint for code standards
- TypeScript for type safety
- Prettier for code formatting
- Git hooks for pre-commit validation

---

This architecture ensures scalability, maintainability, and excellent developer experience while delivering a robust social media platform with real-time capabilities.
