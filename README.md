# Clerk Expo UI

A UI component library for Clerk authentication in React Native/Expo applications. This package provides ready-to-use UI components for authentication flows in Expo applications using Clerk as the authentication provider.

> ⚠️ WARNING: This package is currently in beta and is not ready for production use. It is not recommended for use in production applications.

## Features

- **Complete Authentication UI**: Pre-built components for sign-in, sign-up, and sign-out flows
- **OAuth Support**: Built-in support for OAuth providers (Google, Apple, etc.)
- **TypeScript Support**: Fully typed components for better developer experience
- **Customizable**: Components can be customized to match your app's design
- **Expo Router Integration**: Works seamlessly with Expo Router for navigation

## Installation

This library is installed by copying all of the component files to the local project's `components/clerk` directory:

```bash
npx @brianmmdev/clerk-expo-ui@latest
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
pnpm add @clerk/clerk-expo expo-linear-gradient expo-linking expo-router expo-web-browser
```

## Quick Start

1. Set up Clerk in your Expo application
2. Configure deep linking for OAuth authentication
3. Import and use the components in your screens

```tsx
import { SignIn, SignUp, SignOutButton } from 'clerk-expo-ui';

// Sign In Screen
function SignInScreen() {
  return (
    <SignIn 
      scheme="your-app-scheme://" 
      signUpUrl="/(auth)/sign-up"
      homeUrl="/(tabs)"
    />
  );
}

// Sign Up Screen
function SignUpScreen() {
  return (
    <SignUp 
      scheme="your-app-scheme://" 
      signInUrl="/(auth)"
      homeUrl="/(tabs)"
    />
  );
}
```

## Components

### Authentication Components

- **SignIn**: Complete sign-in form with email and OAuth options
- **SignUp**: Complete sign-up form with email and OAuth options
- **SignOutButton**: Button for signing out users

### UI Components

- **Button**: A customizable button component with gradient background
- **Input**: A form input component with error handling
- **OAuthButton**: OAuth authentication button for various providers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
