// Mock do @auth/prisma-adapter
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({}))
}));

// Mock de NextAuth
jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  })),
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}));

// Mock simples de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    collectionVideo: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    collectionChannel: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    collectionPlaylist: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    collectionSettings: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));

// Mock de módulos externos
jest.mock('next/server', () => ({
  NextRequest: class {
    constructor(data = {}) {
      this.json = jest.fn().mockResolvedValue(data);
      this.url = new URL('http://localhost:3000/test');
    }
  },
  NextResponse: {
    json: jest.fn((data, status = 200) => ({
      data,
      status,
      json: () => data
    }))
  }
}));

// Mock de ferramentas de criptografia
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: () => 'random123' }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hash123')
  })
}));
