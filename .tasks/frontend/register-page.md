# Register Page - Once UI Implementation

## Route
`/register`

## File Structure
```
src/app/(auth)/register/
├── page.tsx
└── RegisterForm.tsx
```

## page.tsx
```tsx
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <RegisterForm />
  );
}
```

## RegisterForm.tsx
```tsx
"use client";

import { useState } from 'react';
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
import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    }),
    onSuccess: () => {
      router.push('/login');
    },
    onError: (err: Error) => {
      setError(err.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    registerMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Create your account
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
          <Column gap="16">
            <Input
              id="name"
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
            
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />

            <Button 
              type="submit" 
              variant="primary" 
              size="l" 
              fillWidth
              loading={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </Column>
        </form>

        <Column gap="12" horizontal="center">
          <Row gap="4" vertical="center">
            <Text variant="body-default-s" onBackground="neutral-weak">
              Already have an account?
            </Text>
            <Text 
              variant="body-default-s" 
              onBackground="brand-strong"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/login')}
            >
              Sign in
            </Text>
          </Row>
        </Column>
      </Card>
    </Column>
  );
}
```

## Once UI Components Used
| Component | Purpose |
|-----------|---------|
| `Column` | Vertical layout container |
| `Row` | Horizontal layout container |
| `Card` | Content container with styling |
| `Text` | Typography with variant props |
| `Input` | Form input with built-in label |
| `Button` | Actions with variant, size, loading states |
| `Icon` | Icon display |

## React Query Integration
```tsx
const registerMutation = useMutation({
  mutationFn: () => authApi.register({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.confirmPassword,
  }),
  onSuccess: () => {
    router.push('/login');
  },
  onError: (err: Error) => {
    setError(err.message);
  },
});
```

## API Integration
- POST `/api/auth/register`
- Request body: `{ name, email, password, password_confirmation }`

## Validation Rules
1. ✅ Name - required
2. ✅ Email - required, valid email format
3. ✅ Password - required, minimum 8 characters
4. ✅ Confirm Password - must match password

## Features
1. ✅ Responsive centered layout
2. ✅ Loading state on button
3. ✅ Error message display with danger styling
4. ✅ Form validation (required, min length, password match)
5. ✅ Navigation to login page
6. ✅ Once UI semantic props for all styling
7. ✅ Auto-redirect on success
