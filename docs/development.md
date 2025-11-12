# Development Guide

This guide covers the development workflow, coding standards, and best practices for the Stenographer project.

## Table of Contents

- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Code Review Process](#code-review-process)

## Development Setup

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/stenographer.git
   cd stenographer
   npm install
   cd frontend && npm install
   cd ../firebase/functions && npm install
   ```

2. **Firebase Emulators**
   ```bash
   cd firebase
   firebase emulators:start
   ```

3. **Start Frontend Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```

### Environment Setup

Use Firebase emulators for local development:

```bash
# In firebase directory
firebase emulators:start --only auth,firestore,storage,functions
```

Update `frontend/.env.local`:
```env
VITE_FIREBASE_USE_EMULATOR=true
VITE_API_BASE_URL=http://localhost:5001/your-project/us-central1
```

## Coding Standards

### TypeScript

- Use strict mode
- Define types for all function parameters and return values
- Prefer interfaces over types for object shapes
- Use `const` assertions for literal types

### React Components

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use TypeScript for all props

**Example:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  onClick, 
  children 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `MatterCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `errorUtils.ts`)
- Services: `camelCase.service.ts` (e.g., `matter.service.ts`)
- Types: `camelCase.ts` in `shared/types/` (e.g., `matter.ts`)

### Code Organization

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Generic components (Button, Modal)
│   ├── matters/      # Matter-specific components
│   └── ...
├── pages/            # Page-level components
├── services/         # API service layer
├── contexts/         # React contexts
├── hooks/            # Custom hooks
└── utils/            # Utility functions
```

## Git Workflow

### Branch Strategy

- `master`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Messages

Follow conventional commits:

```
feat: Add matter creation modal
fix: Resolve file upload validation issue
docs: Update API documentation
test: Add integration tests for auth
refactor: Simplify matter service
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR
4. Ensure all tests pass
5. Request review
6. Address feedback
7. Merge after approval

## Testing Guidelines

### Unit Tests

- Test individual functions and utilities
- Mock external dependencies
- Aim for >80% coverage

### Integration Tests

- Test component interactions
- Test service layer with mocked APIs
- Test user flows

### E2E Tests

- Test critical user journeys
- Use Playwright for browser automation
- Run in CI/CD pipeline

### Writing Tests

```typescript
describe('MatterService', () => {
  it('should create a matter', async () => {
    const matter = await MatterService.createMatter({
      title: 'Test Matter',
      clientName: 'Test Client',
    }, 'user-id');

    expect(matter.matterId).toBeDefined();
    expect(matter.title).toBe('Test Matter');
  });
});
```

## Code Review Process

### Review Checklist

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] No console.logs or debug code
- [ ] Error handling is appropriate
- [ ] Accessibility considerations
- [ ] Performance implications considered
- [ ] Documentation updated if needed

### Review Focus Areas

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it maintainable and readable?
3. **Testing**: Are there adequate tests?
4. **Security**: Any security concerns?
5. **Performance**: Any performance issues?

## Common Patterns

### Service Layer Pattern

```typescript
export class MatterService {
  static async getMatters(
    userId: string,
    filters?: MatterFilters
  ): Promise<Matter[]> {
    // Implementation
  }

  static async createMatter(
    data: CreateMatterData,
    userId: string
  ): Promise<string> {
    // Implementation
  }
}
```

### Custom Hook Pattern

```typescript
export const useMatters = (userId: string) => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatters();
  }, [userId]);

  const loadMatters = async () => {
    try {
      setLoading(true);
      const data = await MatterService.getMatters(userId);
      setMatters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { matters, loading, error, refetch: loadMatters };
};
```

## Debugging

### Frontend

- Use React DevTools
- Check browser console
- Use `console.log` sparingly (remove before commit)
- Use breakpoints in VS Code

### Firebase Functions

```bash
# View logs
firebase functions:log

# Local testing
firebase emulators:start --only functions
```

### AWS Lambda

```bash
# View CloudWatch logs
aws logs tail /aws/lambda/stenographer-ocr --follow
```

## Performance Optimization

1. **Code Splitting**: Use dynamic imports for large components
2. **Memoization**: Use `React.memo` and `useMemo` appropriately
3. **Lazy Loading**: Lazy load routes and heavy components
4. **Image Optimization**: Optimize images before upload
5. **Bundle Size**: Monitor bundle size and split as needed

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

