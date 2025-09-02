# 🎬 YouTube Organizer

An advanced YouTube video organizer with integrated player, automatic transcripts, and intelligent AI summaries.

## ✨ Main Features

### 🎬 **Modal with Advanced Player**
- Integrated YouTube player with elegant interface
- Tabs for Player, Transcript, and AI Summary
- Intuitive and responsive controls
- Detailed video information

### 📝 **Transcript System**
- Automatic transcript fetching via YouTube API
- Formatted display with timestamps
- Interactive navigation in text
- Support for multiple languages

### 🤖 **Intelligent AI Summary**
- Integration with OpenAI GPT for generating summaries
- Structured and concise summaries
- Main points highlights
- Sentiment analysis and topic analysis

### 📥 **Video Import**
- Automatic import of YouTube playlists
- Visual progress bar in real-time
- Intelligent duplicate handling
- Detailed import statistics

### 🔍 **Advanced Filters System**
- Search by text (title, channel, description, tags)
- Filters by category, tag, period, and quality
- Flexible sorting by any field
- Intelligent pagination

### 📁 **Organization by Categories and Tags**
- Hierarchical category system
- Customizable tags
- Many-to-many relationships
- Drag-and-drop interface

## 🚀 Technologies Used

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icons

### **Backend**
- **Next.js API Routes** - RESTful API
- **Prisma** - Database ORM
- **SQLite** - Local database

### **Authentication**
- **NextAuth.js** - Authentication system
- **Google OAuth** - Login with Google

### **External APIs**
- **YouTube Data API v3** - YouTube data
- **OpenAI API** - AI summary generation
- **Google Translate API** - Translation (optional)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google account (for APIs)
- YouTube API key
- OpenAI API key (optional)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd youtube-organizer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit the `.env` file with your keys:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# YouTube Data API v3
YOUTUBE_API_KEY="your-youtube-api-key-here"

# OpenAI API (for AI summaries)
OPENAI_API_KEY="your-openai-api-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Configure the database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the project:**
```bash
npm run dev
```

Access: http://localhost:3000

## 📖 How to Use

### **1. Initial Configuration**
- Configure your API keys in the `.env` file
- Log in with your Google account
- Configure your categories and tags

### **2. Import Playlists**
- In the "Playlists" page, click "Sync Playlist"
- Paste the ID or URL of the YouTube playlist
- Wait for automatic synchronization

### **3. Import Videos**
- In the "Playlists" page, click "Import Videos" on any playlist
- Follow the import progress
- View import statistics

### **4. Organize Videos**
- Use categories to group videos by theme
- Add tags for granular classification
- Use advanced filters to find videos

### **5. Watch and Study**
- Click "Watch" on any video
- Use tabs to switch between Player, Transcript, and AI Summary
- Navigate through transcript timestamps
- Read AI-generated intelligent summaries

## 🎯 Project Structure

```
youtube-organizer/
├── src/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication
│   │   ├── categories/    # CRUD for categories
│   │   ├── tags/          # CRUD for tags
│   │   ├── playlists/     # CRUD for playlists
│   │   └── videos/        # CRUD for videos
│   ├── categories/        # Categories page
│   ├── playlists/         # Playlists page
│   ├── tags/              # Tags page
│   ├── videos/            # Videos page
│   └── layout.tsx         # Main layout
├── components/            # React components
│   ├── AuthGuard.tsx      # Route protection
│   ├── VideoModal.tsx     # Modal with player
│   ├── VideoFilters.tsx   # Filters system
│   └── Pagination.tsx     # Pagination component
└── lib/                   # Utilities
    ├── prisma.ts          # Prisma client
    ├── auth.ts            # NextAuth configuration
    ├── youtube.ts         # YouTube API client
    ├── services/          # Application services
    │   ├── transcript.ts  # Transcript service
    │   ├── ai-summary.ts  # AI service
    │   ├── playlist.ts    # Playlist service
    │   ├── category.ts    # Category service
    │   └── tag.ts         # Tag service
    └── utils/             # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── .env                   # Environment variables
```

## 🔧 Implemented APIs

### **Videos**
- `GET /api/videos` - List videos with filters
- `POST /api/videos/sync` - Import video from YouTube
- `GET /api/videos/[id]/transcript` - Fetch transcript
- `GET /api/videos/[id]/summary` - Generate AI summary

### **Playlists**
- `GET /api/playlists` - List playlists
- `POST /api/playlists/sync` - Sync playlist
- `POST /api/playlists/[id]/sync-videos` - Import videos from playlist

### **Organization**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag

## 🎨 Interface and UX

### **Design System**
- **Colors:** Modern palette with blue, green, and purple tones
- **Typography:** Inter for better readability
- **Components:** Reusable and accessible
- **Responsiveness:** Mobile-first approach

### **Loading States**
- Elegant spinners during operations
- Real-time visual feedback
- Detailed progress messages

### **Error Handling**
- Friendly error messages
- Solution suggestions
- Intelligent fallbacks

##  CI/CD and Deploy

### **GitHub Actions**
The project includes complete CI/CD configuration with:
- **Automatic Linting and Type Checking**
- **Test Execution** in multiple stages
- **Build and Deploy** automation
- **Coverage Reports** for tests
- **Security Analysis** with CodeQL

### **Deploy Configuration**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### **Deploy Environments**
- **Development:** Automatic deploy on every push
- **Staging:** Manual deploy for tests
- **Production:** Deploy via approved pull request

## 📈 Monitoring and Analytics

### **Performance Metrics**
- **Core Web Vitals** monitored
- **API response times**
- **Error rates** for operations
- **Resource usage** (CPU, memory)

### **Usage Analytics**
- **Most visited pages**
- **Most used features**
- **Average session time**
- **User conversion rate**

### **Integrated Tools**
- **Vercel Analytics** for web metrics
- **Sentry** for error monitoring
- **DataDog** for system metrics
- **Custom Dashboards** for specific KPIs

## 🧪 Testing and Quality

### **Test Coverage**
- **Unit Tests:** Complete coverage of services and utilities
- **Integration Tests:** Complete workflows and inter-service interactions
- **E2E Tests:** Complete user scenarios with Playwright
- **Performance Tests:** Benchmarks and performance monitoring

### **Run Tests**
```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Test coverage
npm run test:coverage
```

### **Test Structure**
```
__tests__/
├── unit/                    # Unit tests
│   ├── services/           # Service tests
│   └── utils/              # Utility tests
├── integration/            # Integration tests
│   ├── collections-workflow.test.ts
│   └── api/
├── e2e/                    # End-to-end tests
│   ├── collections-flow.test.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
└── performance/            # Performance tests
    └── benchmark.test.ts
```

## 📚 Documentation

### **Technical Documentation**
- [🏗️ System Architecture](./docs/architecture.md) - Complete overview of architecture, components, and data flows
- [📚 API Reference](./docs/api-reference.md) - Complete REST API documentation with examples
- [🛠️ Development Guide](./docs/development-guide.md) - Setup, code patterns, and best practices
- [🧪 Testing Strategy](./docs/testing-strategy.md) - Unit, integration, E2E, and performance tests

### **User Documentation**
- [📖 User Guide](./docs/user-guide.md) - Complete guide for using all features
- [❓ FAQ](./docs/faq.md) - Frequently asked questions and solutions
- [🔧 Troubleshooting](./docs/troubleshooting.md) - Common problem solutions
- [🌐 E2E Testing Guide](./docs/e2e-testing-guide.md) - How to run and write E2E tests with Playwright

## 🤝 Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 📞 Support

For support, open an issue on GitHub or contact the development team.

## 🗺️ Roadmap

### **Next Features**

#### **Phase 2: Advanced AI**
- [ ] **Personalized recommendations** based on history
- [ ] **Sentiment analysis** in comments
- [ ] **Automatic tag generation** by AI
- [ ] **Integrated chatbot** for video questions

#### **Phase 3: Collaboration**
- [ ] **Collection sharing** with other users
- [ ] **Comments and annotations** on videos
- [ ] **Collaborative workspaces**
- [ ] **Version control** for collections

#### **Phase 4: Mobile & PWA**
- [ ] **Complete PWA app**
- [ ] **Offline synchronization** advanced
- [ ] **Push notifications** native
- [ ] **Interface optimized** for mobile devices

#### **Phase 5: Enterprise**
- [ ] **Multi-tenant** with data isolation
- [ ] **Corporate integrations** (Slack, Teams, etc.)
- [ ] **Advanced analytics** for teams
- [ ] **APIs for integration** with external systems

### **Planned Technical Improvements**
- [ ] **Migration to PostgreSQL** for scalability
- [ ] **Redis implementation** for distributed cache
- [ ] **Microservices** for specific components
- [ ] **GraphQL API** for flexible queries
- [ ] **Real-time updates** with WebSockets

## 🤝 Contribution

### **How to Contribute**
1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Contribution Guidelines**
- Follow established code patterns
- Write tests for new features
- Update documentation when necessary
- Keep commits small and descriptive
- Use conventional commits

### **Development Setup**
```bash
# Install dependencies
npm install

# Configure pre-commit hooks
npm run prepare

# Run linting
npm run lint

# Run tests
npm run test

# Check coverage
npm run test:coverage
```

## 📝 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 📞 Support and Contact

### **Support Channels**
- **📧 Email:** support@youtube-organizer.com
- **💬 Discord:** [YouTube Organizer Community](https://discord.gg/youtube-organizer)
- **🐛 GitHub Issues:** [Report Bugs](https://github.com/youtube-organizer/issues)
- **📚 Help Center:** [Help Center](https://help.youtube-organizer.com)

### **Additional Resources**
- **📰 Blog:** News and tutorials
- **🎥 YouTube:** Tutorial videos
- **📱 Newsletter:** Monthly updates
- **🏷️ Status Page:** Service status

---

## 🎉 Conclusion

The **YouTube Organizer** represents a complete and modern solution for YouTube content organization, combining:

- ✨ **Elegant interface** and intuitive
- 🤖 **Advanced artificial intelligence**
- 🧪 **Comprehensive testing** and guaranteed quality
- 📚 **Complete documentation** and detailed
- 🚀 **Scalable architecture** and performant
- 👥 **Active community** and dedicated support

**Transform your YouTube learning experience with intelligent organization and AI!** 🎬✨
