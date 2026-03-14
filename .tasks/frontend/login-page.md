# Login Page - Once UI Implementation

## Route
`/login`

## File Structure
```
src/app/(auth)/login/
├── page.tsx
└── LoginForm.tsx
```

## Installation
```bash
npm install @once-ui-system/core @tanstack/react-query
```

## page.tsx
```tsx
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <LoginForm />
  );
}
```

## LoginForm.tsx
```tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Column,
  Row,
  Card,
  Text,
  Input,
  Button,
  Icon,
} from "@once-ui-system/core";
import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    },
    onError: (err: Error) => {
      setError(err.message || 'Invalid email or password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <Column 
      fillWidth 
      horizontal="center" 
      vertical="center"
      background="page"
      minHeight="100vh"
      paddingX="24"
    >
      <Card 
        padding="32" 
        radius="xl" 
        direction="column" 
        gap="24"
        maxWidth="400"
        fillWidth
      >
        <Column gap="8" horizontal="center">
          <Row gap="8" vertical="center">
            <Icon name="package" size="xl" onBackground="brand-strong" />
            <Text variant="heading-default-l" fontWeight="xl">
              CoreInventory
            </Text>
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Sign in to your account
          </Text>
        </Column>

        {error && (
          <Card 
            padding="12" 
            radius="m" 
            background="danger-alpha-weak"
            border="danger-medium"
          >
            <Text variant="body-default-s" onBackground="danger-strong">
              {error}
            </Text>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Column gap="20">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <Button 
              type="submit" 
              variant="primary" 
              size="l" 
              fillWidth
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </Column>
        </form>

        <Column gap="12" horizontal="center">
          <Text 
            variant="body-default-s" 
            onBackground="neutral-weak"
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Text>
          
          <Row gap="4" vertical="center">
            <Text variant="body-default-s" onBackground="neutral-weak">
              Don't have an account?
            </Text>
            <Text 
              variant="body-default-s" 
              onBackground="brand-strong"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/register')}
            >
              Sign up
            </Text>
          </Row>
        </Column>
      </Card>
    </Column>
  );
}
```

## Alternative: Using NextAuth with Once UI

```tsx
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Column,
  Row,
  Card,
  Text,
  Input,
  Button,
  Icon,
} from "@once-ui-system/core";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <Column 
      fillWidth 
      horizontal="center" 
      vertical="center"
      background="page"
      minHeight="100vh"
      paddingX="24"
    >
      <Card padding="32" radius="xl" direction="column" gap="24" maxWidth="400" fillWidth>
        <Column gap="8" horizontal="center">
          <Row gap="8" vertical="center">
            <Icon name="package" size="xl" onBackground="brand-strong" />
            <Text variant="heading-default-l" fontWeight="xl">CoreInventory</Text>
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak">Sign in to your account</Text>
        </Column>

        {error && (
          <Card padding="12" radius="m" background="danger-alpha-weak" border="danger-medium">
            <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Column gap="20">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" variant="primary" size="l" fillWidth loading={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Column>
        </form>

        <Column gap="12" horizontal="center">
          <Text variant="body-default-s" onBackground="neutral-weak" style={{ cursor: 'pointer' }}>
            Forgot password?
          </Text>
          <Row gap="4" vertical="center">
            <Text variant="body-default-s" onBackground="neutral-weak">Don't have an account?</Text>
            <Text variant="body-default-s" onBackground="brand-strong" style={{ cursor: 'pointer' }} onClick={() => router.push('/register')}>
              Sign up
            </Text>
          </Row>
        </Column>
      </Card>
    </Column>
  );
}
```

## API Integration
- POST `/api/auth/login` via custom API or NextAuth
- Uses React Query `useMutation` for handling loading/error states
- Stores token in localStorage on success

## Once UI Components Used
| Component | Purpose |
|-----------|---------|
| `Column` | Vertical layout container |
| `Row` | Horizontal layout container |
| `Card` | Content container with padding, radius, border |
| `Text` | Typography with variant props |
| `Input` | Form input with built-in label |
| `Button` | Actions with variant, size, loading states |
| `Icon` | Icon display |

## Key Features
1. ✅ Responsive centered layout using Column/Row
2. ✅ Loading state on button via `loading` prop
3. ✅ Error message display with danger styling
4. ✅ Form validation (required attributes)
5. ✅ Navigation to register page
6. ✅ Once UI semantic props for all styling
