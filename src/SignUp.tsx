import { Input } from './components/Input';
import OAuthButton from './components/OAuthButton';
import { Button } from './components/Button';
import { useClerk, useSignUp } from '@clerk/clerk-expo';
import { EnvironmentResource } from '@clerk/types';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}

interface Props {
  scheme?: string;
  signInUrl?: string;
  homeUrl?: string;
}

export function SignUp({
  scheme = "catalystapp",
  signInUrl = "/(auth)",
  homeUrl = "/"
}: Props) {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = Router.useRouter();
  const clerk = useClerk();

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource;
  
  // Extract available OAuth strategies directly from the environment
  const oauthStrategies = Object.entries(environment?.userSettings?.social || {}) as [string, any][];
  const filteredStrategies = oauthStrategies
    .filter(([_, provider]: [string, any]) => provider?.enabled)
    .map(([key]: [string, any]) => key);

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  
  async function onSignUpPress() {
    if (!isLoaded || !signUp) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onPressVerify() {
    if (!isLoaded || !signUp) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace(homeUrl);
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }

  if (!isLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Create Your {environment.displayConfig.applicationName} Account</Text>
          <Text style={styles.headerSubtitle}>Welcome! Please fill in the details to get started.</Text>
        </View>

        <View style={styles.formContainer}>
          {!pendingVerification ? (
            <>
              {filteredStrategies.length > 0 && (
                <View style={styles.socialButtonsContainer}>
                  {scheme && filteredStrategies.map((strategy: string) => (
                    <View key={strategy} style={styles.socialButtonWrapper}>
                      <OAuthButton strategy={strategy as any} hideText={oauthStrategies.length > 3} scheme={scheme} />
                    </View>
                  ))}
                </View>
              )}

              {filteredStrategies.length > 0 && (
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              <Input
                label="Email address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={(email: string) => setEmailAddress(email)}
                placeholder="Enter your email"
              />
              <Input
                label="Password"
                value={password}
                secureTextEntry={true}
                onChangeText={(password: string) => setPassword(password)}
                placeholder="Create a password"
              />
              <Button
                onPress={onSignUpPress}
                disabled={!emailAddress || !password}
              >
                Continue
              </Button>

              <TouchableOpacity
                onPress={() => router.replace(signInUrl)}
                style={styles.switchModeButton}
              >
                <Text style={styles.switchModeText}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationTitle}>Verify Your Email</Text>
              <Text style={styles.verificationSubtitle}>
                We&apos;ve sent a verification code to {emailAddress}
              </Text>
              
              <Input
                label="Verification Code"
                value={code}
                onChangeText={(code: string) => setCode(code)}
                placeholder="Enter verification code"
                keyboardType="number-pad"
              />
              
              <Button
                onPress={onPressVerify}
                disabled={!code}
              >
                Verify Email
              </Button>
              
              <TouchableOpacity
                onPress={() => {
                  setPendingVerification(false);
                  setCode('');
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Back to sign up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  contentWrapper: {
    width: "100%",
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialButton: {
    backgroundColor: "#424242",
    borderRadius: 10,
    padding: 6,
    height: 32,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    width: 50,
    textAlign: "center",
    color: "#757575",
  },
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 8,
  },
  switchModeText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
  verificationContainer: {
    paddingVertical: 16,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: "#424242",
    marginBottom: 16,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#757575",
  },
});

export default SignUp;
