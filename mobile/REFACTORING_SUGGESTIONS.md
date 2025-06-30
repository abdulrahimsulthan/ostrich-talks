# Ostrich Talks Mobile App - Refactoring Suggestions

## 🔍 Current Issues & Improvements

### 1. **API Integration Issues**

#### Current Problems:
- Hardcoded API URL in `lib/api.ts`
- No proper error handling for API calls
- Missing authentication token management
- No offline support or retry mechanisms

#### Suggested Fixes:
```typescript
// lib/api.ts - Improved version
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://localhost:5000/api'
      : 'https://your-production-api.com/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          await this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleUnauthorized() {
    await AsyncStorage.removeItem('auth_token');
    // Navigate to login screen
  }

  // API methods
  async get(endpoint: string, params?: any) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return new Error(error.response.data?.message || 'API Error');
    }
    return new Error('Network Error');
  }
}

export default new ApiService();
```

### 2. **State Management Improvements**

#### Current Problems:
- Inconsistent store structure
- Missing TypeScript interfaces
- No proper error handling in stores
- Stores not syncing with backend

#### Suggested Fixes:

```typescript
// types/interfaces.ts - Enhanced interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  profileUri: string;
  bio?: string;
  level: number;
  xp: number;
  feathers: number;
  willPower: number;
  streak: number;
  streakLevel: number;
  league: string;
  leaguePoints: number;
  followers: number;
  following: number;
  joined: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  language: 'en' | 'es' | 'fr' | 'de' | 'pt';
  theme: 'light' | 'dark' | 'auto';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'conversation' | 'reading' | 'listening';
  category: 'beginner' | 'intermediate' | 'advanced';
  difficulty: number;
  estimatedDuration: number;
  exercises: Exercise[];
  xpReward: number;
  featherReward: number;
  isPremium: boolean;
  prerequisites?: string[];
}

export interface Exercise {
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'speaking' | 'listening' | 'writing';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface Progress {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  score: number;
  mistakes: number;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  xpEarned: number;
  feathersEarned: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    xp: number;
    feathers: number;
  };
}

export interface League {
  name: string;
  currentPoints: number;
  requiredPoints: number;
  progress: number;
  rank: number;
  totalPlayers: number;
}
```

```typescript
// store/userStore.ts - Improved version
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserSettings } from '@/types/interfaces';
import api from '@/lib/api';

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithFirebase: (firebaseUid: string, email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const userStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;
            
            await AsyncStorage.setItem('auth_token', token);
            set({ user, token, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false 
            });
            throw error;
          }
        },

        loginWithFirebase: async (firebaseUid: string, email: string, name: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/auth/firebase', { 
              firebaseUid, 
              email, 
              name 
            });
            const { user, token } = response.data;
            
            await AsyncStorage.setItem('auth_token', token);
            set({ user, token, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Firebase login failed',
              isLoading: false 
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.warn('Logout API call failed:', error);
          } finally {
            await AsyncStorage.removeItem('auth_token');
            set({ user: null, token: null, error: null });
          }
        },

        updateProfile: async (updates: Partial<User>) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put('/users/profile', updates);
            set({ user: response.data.user, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Profile update failed',
              isLoading: false 
            });
            throw error;
          }
        },

        updateSettings: async (settings: Partial<UserSettings>) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.put('/users/settings', { settings });
            const updatedUser = { ...get().user, settings: response.data.settings };
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Settings update failed',
              isLoading: false 
            });
            throw error;
          }
        },

        refreshUser: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.get('/auth/me');
            set({ user: response.data.user, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to refresh user',
              isLoading: false 
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'user-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token 
        }),
      }
    )
  )
);

export default userStore;
```

### 3. **Component Structure Improvements**

#### Current Problems:
- Missing error boundaries
- No loading states
- Inconsistent styling
- Hardcoded values
- Missing accessibility

#### Suggested Fixes:

```typescript
// components/common/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import colors from '@/constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = colors.primary,
  text
}) => (
  <View className="flex-1 justify-center items-center">
    <ActivityIndicator size={size} color={color} />
    {text && (
      <Text className="mt-2 text-textSecondary text-center">{text}</Text>
    )}
  </View>
);

// components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl font-bold text-textPrimary mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-textSecondary text-center mb-4">
            We're sorry for the inconvenience. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => this.setState({ hasError: false })}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'rounded-lg font-semibold items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-primary'
  };

  const sizeClasses = {
    small: 'px-4 py-2',
    medium: 'px-6 py-3',
    large: 'px-8 py-4'
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary'
  };

  const disabledClasses = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : 'white'} />
      ) : (
        <Text className={`${textClasses[variant]} text-center`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

### 4. **Navigation Improvements**

#### Current Problems:
- No proper navigation types
- Missing deep linking
- No navigation state persistence

#### Suggested Fixes:

```typescript
// types/navigation.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lessons: undefined;
  League: undefined;
  Quest: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeIndex: undefined;
  LessonDetail: { lessonId: string };
  LessonQuiz: { lessonId: string };
  Profile: { userId?: string };
};

// navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '@/types/navigation';
import userStore from '@/store/userStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    }}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Lessons" component={LessonsScreen} />
    <Tab.Screen name="League" component={LeagueScreen} />
    <Tab.Screen name="Quest" component={QuestScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const Navigation = () => {
  const { token } = userStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 5. **Performance Improvements**

#### Current Problems:
- No image optimization
- Missing memoization
- No lazy loading
- Inefficient re-renders

#### Suggested Fixes:

```typescript
// hooks/useMemoizedCallback.ts
import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>(callback);
  ref.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
}

// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// components/optimized/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, ImageProps, ActivityIndicator, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: string;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  placeholder,
  fallback,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUri = hasError ? fallback : uri;

  return (
    <View style={style}>
      <ExpoImage
        source={imageUri}
        placeholder={placeholder}
        contentFit="cover"
        transition={200}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        style={style}
        {...props}
      />
      {isLoading && (
        <View className="absolute inset-0 justify-center items-center bg-gray-100">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};
```

### 6. **Testing Improvements**

#### Current Problems:
- No unit tests
- No integration tests
- No E2E tests

#### Suggested Fixes:

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} loading={true} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});

// __tests__/store/userStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import userStore from '@/store/userStore';

describe('userStore', () => {
  beforeEach(() => {
    userStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  it('should update user on successful login', async () => {
    const mockUser = { id: '1', name: 'Test User' };
    const mockToken = 'test-token';

    await act(async () => {
      // Mock API call
      jest.spyOn(api, 'post').mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      });

      await userStore.getState().login('test@example.com', 'password');
    });

    expect(userStore.getState().user).toEqual(mockUser);
    expect(userStore.getState().token).toEqual(mockToken);
  });
});
```

### 7. **Security Improvements**

#### Current Problems:
- No input validation
- No secure storage for sensitive data
- No certificate pinning

#### Suggested Fixes:

```typescript
// utils/validation.ts
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

// utils/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
```

### 8. **Accessibility Improvements**

#### Current Problems:
- Missing accessibility labels
- No screen reader support
- Poor color contrast

#### Suggested Fixes:

```typescript
// components/accessible/AccessibleButton.tsx
import React from 'react';
import { TouchableOpacity, Text, AccessibilityInfo } from 'react-native';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  ...props
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    accessible={true}
    accessibilityLabel={accessibilityLabel || title}
    accessibilityHint={accessibilityHint}
    accessibilityRole={accessibilityRole}
    accessibilityState={{ disabled }}
    {...props}
  >
    <Text>{title}</Text>
  </TouchableOpacity>
);
```

## 🚀 Implementation Priority

### High Priority (Fix First):
1. **API Integration** - Connect to the new backend
2. **Authentication** - Implement proper auth flow
3. **Error Handling** - Add comprehensive error handling
4. **Type Safety** - Add proper TypeScript interfaces

### Medium Priority:
1. **State Management** - Refactor stores
2. **Component Structure** - Create reusable components
3. **Navigation** - Improve navigation structure
4. **Performance** - Add optimizations

### Low Priority:
1. **Testing** - Add comprehensive tests
2. **Accessibility** - Improve accessibility
3. **Security** - Add security measures

## 📋 Action Items

1. **Update API Configuration**
   - Replace hardcoded URLs with environment-based configuration
   - Add proper error handling and retry logic
   - Implement token management

2. **Refactor Stores**
   - Add proper TypeScript interfaces
   - Implement backend synchronization
   - Add error handling and loading states

3. **Create Common Components**
   - Loading spinners
   - Error boundaries
   - Reusable buttons and inputs
   - Optimized images

4. **Improve Navigation**
   - Add proper TypeScript types
   - Implement deep linking
   - Add navigation state persistence

5. **Add Testing**
   - Unit tests for components
   - Integration tests for stores
   - E2E tests for critical flows

6. **Performance Optimization**
   - Add memoization
   - Implement lazy loading
   - Optimize images and assets

This refactoring will significantly improve the app's maintainability, performance, and user experience while ensuring it works seamlessly with the new backend. 