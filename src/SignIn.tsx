import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { EnvironmentResource, SignInFirstFactor } from "@clerk/types";
// Using any type to avoid TypeScript errors with @expo/vector-icons
// @ts-ignore - Ignoring missing type declarations for @expo/vector-icons
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import OAuthButton from "./components/OAuthButton";
import ContinueButton from "./components/ContinueButton";
import ErrorText from "./components/ErrorText";

enum FormState {
  SignIn,
  VerifyEmailCode,
  AlternateFirstFactor,
  SecondFactor,
  Done
}

interface InitialSignInFormProps {
  onSetFirstFactor: (firstFactor: SignInFirstFactor) => void
  onSetSupportedFirstFactors: (firstFactors: SignInFirstFactor[]) => void
  scheme?: string
  signUpUrl?: string
}

function InitialSignInForm({ 
  onSetFirstFactor, 
  onSetSupportedFirstFactors,
  scheme = "catalyst://",
  signUpUrl = "/(auth)/sign-up"
}: InitialSignInFormProps) {
  const router = Router.useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const clerk = useClerk()

  const [errorMessage, setErrorMessage] = useState("");
  const [erroredParams, setErroredParams] = useState<string[]>([])
  const [identifier, setIdentifier] = useState("");
  const [identifierLabel, setIdentifierLabel] = useState("Email address");
  const [identifierPlaceholder, setIdentifierPlaceholder] = useState("Enter your email");

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource
  const oauthStrategies = Object.entries(environment?.userSettings?.social || {}) as [string, any][];
  const filteredStrategies = oauthStrategies
    .filter(([_, provider]: [string, any]) => provider?.enabled)
    .map(([key]: [string, any]) => key);

  useEffect(() => {
    if (!environment) {
      return;
    }
    const isEmailEnabled = environment?.userSettings?.attributes?.email_address?.enabled && environment?.userSettings?.attributes?.email_address?.used_for_first_factor;
    const isUsernameEnabled = environment?.userSettings?.attributes?.username?.enabled && environment?.userSettings?.attributes?.username?.used_for_first_factor;
    
    if (isEmailEnabled && isUsernameEnabled) {
      setIdentifierLabel("Email address or username");
      setIdentifierPlaceholder("Enter your email or username");
    } else if (isEmailEnabled) {
      setIdentifierLabel("Email address");
      setIdentifierPlaceholder("Enter your email");
    } else if (isUsernameEnabled) {
      setIdentifierLabel("Username");
      setIdentifierPlaceholder("Enter your username");
    }

  }, [environment])

  async function onContinuePressed() {
    setErrorMessage('')
    if (!isLoaded || !signIn) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier
      })
      const { supportedFirstFactors } = signInAttempt
      if (!supportedFirstFactors) {
        throw new Error("No supported first factors")
      }
      const firstFactor = determineFirstFactor(supportedFirstFactors)
      await signInAttempt.prepareFirstFactor({
        // @ts-ignore TODO: fix this
        strategy: firstFactor.strategy,
        // @ts-ignore TODO: fix this
        emailAddressId: firstFactor.emailAddressId,
      })
      onSetFirstFactor(firstFactor)
      onSetSupportedFirstFactors(supportedFirstFactors)
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2))
      const { errors } = err
      setErrorMessage(errors[0].message)
      setErroredParams(errors.map((e: any) => e?.meta?.paramName))
    }
  }

  function determineFirstFactor(supportedFirstFactors: SignInFirstFactor[]) {
    return supportedFirstFactors.find((f) => f.strategy === "email_code") || supportedFirstFactors[0]
  }

  return (
    <Form title={`Sign in to ${environment.displayConfig.applicationName}`} subtitle="Welcome back! Please sign in to continue">
      {oauthStrategies.length > 0 && (
        <View style={styles.socialButtonsContainer}>
          {scheme && filteredStrategies.map((strategy: string) => (
            <View key={strategy} style={styles.socialButtonWrapper}>
              <OAuthButton strategy={strategy as any} hideText={oauthStrategies.length > 3} scheme={scheme} />
            </View>
          ))}
        </View>
      )}

      {oauthStrategies?.length && (
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      <Input
        label={identifierLabel}
        autoCapitalize="none"
        value={identifier}
        onChangeText={(identifier) => setIdentifier(identifier)}
        placeholder={identifierPlaceholder}
        paramName="identifier"
        error={erroredParams.includes("identifier") ? errorMessage : undefined}
      />

      <ErrorText message={errorMessage} />
      
      <ContinueButton onPress={onContinuePressed} disabled={!identifier} />

      <TouchableOpacity
        onPress={() => router.replace(signUpUrl)}
        style={styles.switchModeButton}
      >
        <Text style={styles.switchModeText}>
          Don&apos;t have an account? Sign up
        </Text>
      </TouchableOpacity>
    </Form>
  )
}


interface VerifyEmailCodeProps {
  emailAddress: string
  emailAddressId: string
  onSelectAlternateMethod: () => void
  onEditEmailAddress: () => void
  homeUrl?: string
}

function VerifyEmailCode({ 
  emailAddress, 
  emailAddressId, 
  onSelectAlternateMethod, 
  onEditEmailAddress,
  homeUrl = "/"
}: VerifyEmailCodeProps) {

  const router = Router.useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const clerk = useClerk()

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource

  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Set up the resend timer
  useEffect(() => {
    // Start with disabled resend
    setCanResend(false);
    
    // Set up the timer
    const interval = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    // Clean up the interval
    return () => clearInterval(interval);
  }, []);

  async function onResendPressed() {
    if (!isLoaded || !signIn) {
      return
    }

    try {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailAddressId,
      })
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2));
    }
  }

  async function onContinuePressed() {
    if (!isLoaded || !signIn) {
      return
    }

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code
      })

      if (completeSignIn.status === "complete") {
        await setActive({
          session: completeSignIn.createdSessionId,
        });

        router.replace(homeUrl);
      } else {
        console.error('signInAttempt', JSON.stringify(completeSignIn, null, 2));
      }
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2));
    }
  }

  const headerChildren: ReactNode = (
    <TouchableOpacity
      onPress={onEditEmailAddress}
      style={styles.switchModeButton}
    >
      <Text style={styles.switchModeText}>
        {emailAddress} <Ionicons name="pencil-outline" size={16} color="#5a3df7" />
      </Text>
    </TouchableOpacity>
  )

  return (
    <Form 
      title={`Sign in to ${environment.displayConfig.applicationName}`} 
      subtitle="Welcome back! Please sign in to continue" 
      headerChildren={headerChildren}
    >
      <Input
        autoCapitalize="none"
        value={code}
        onChangeText={(code) => setCode(code)}
        placeholder="Enter your code"
      />

      <TouchableOpacity
        onPress={onResendPressed}
        style={[styles.switchModeButton, !canResend && styles.disabledButton]}
        disabled={!canResend}
      >
        <Text style={[styles.switchModeText, !canResend && styles.disabledText]}>
          Didn't receive a code? {canResend ? "Resend" : `Resend (${resendTimer})`}
        </Text>
      </TouchableOpacity>
      
      <Button
        onPress={onContinuePressed}
        disabled={!code || !isLoaded || !signIn}
      >
        Continue
      </Button>

      <TouchableOpacity
        onPress={onSelectAlternateMethod}
        style={styles.switchModeButton}
      >
        <Text style={styles.switchModeText}>
          Use another method
        </Text>
      </TouchableOpacity>
    </Form>
  )
}

interface AlternateFirstFactorsProps {
  factors: SignInFirstFactor[]
  onSelectFactor: (factor: SignInFirstFactor) => void
  scheme?: string
}

function AlternateFirstFactors({ 
  factors, 
  onSelectFactor,
  scheme = "catalystapp"
}: AlternateFirstFactorsProps) {
  const clerk = useClerk();
  
  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource;
  
  // Filter for OAuth strategies
  const oauthFactors = factors.filter(factor => typeof factor.strategy === 'string' && factor.strategy.startsWith('oauth_'));
  
  return (
    <Form title="Use another method" subtitle="Facing issues? You can use any of these methods to sign in.">
      {oauthFactors.length > 0 && (
        <View style={styles.socialButtonsContainer}>
          {scheme && oauthFactors.map((factor) => {
            // Extract provider name from strategy (e.g., 'oauth_google' -> 'google')
            const provider = factor.strategy.replace('oauth_', '');
            return (
              <View key={factor.strategy} style={styles.socialButtonWrapper}>
                <OAuthButton strategy={provider as any} hideText={false} scheme={scheme} />
              </View>
            );
          })}
        </View>
      )}
      
      {factors.filter(factor => factor.strategy === "email_code" || factor.strategy === "phone_code").map((factor) => (
        <TouchableOpacity 
          key={factor.strategy} 
          style={styles.alternateMethodButton}
          onPress={() => onSelectFactor(factor)}
        >
          <Text style={styles.alternateMethodText}>
            {factor.strategy === "email_code" ? "Email code" : "Phone code"}
          </Text>
        </TouchableOpacity>
      ))}
    </Form>
  )
}

interface FormProps {
  title: string
  subtitle: string
  children: React.ReactNode
  headerChildren?: React.ReactNode
}

function Form({ title, subtitle, children, headerChildren }: FormProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
          {headerChildren}
        </View>

        <View style={styles.formContainer}>
          {children}
        </View>
      </View>
    </View>
  )
}

interface SignInProps {
  scheme?: string;
  signUpUrl?: string;
  homeUrl?: string;
}

export function SignIn({ scheme = "catalystapp", signUpUrl = "/(auth)/sign-up", homeUrl = "/" }: SignInProps) {
  const { signIn, isLoaded } = useSignIn();
  const router = Router.useRouter();
  const clerk = useClerk();

  const [supportedFirstFactors, setSupportedFirstFactors] = useState<SignInFirstFactor[] | null>(null);
  const [formState, setFormState] = useState<FormState>(FormState.SignIn);
  const [selectedFirstFactor, setSelectedFirstFactor] = useState<SignInFirstFactor | null>(null);

  if (!isLoaded) {
    return <ActivityIndicator size="large" />;
  }

  switch (formState) {
    case FormState.SignIn:
      return (
        <InitialSignInForm 
          onSetFirstFactor={(factor) => {
            setSelectedFirstFactor(factor);
            setFormState(FormState.VerifyEmailCode);
          }}
          onSetSupportedFirstFactors={setSupportedFirstFactors}
          scheme={scheme}
          signUpUrl={signUpUrl}
        />
      );
    
    case FormState.VerifyEmailCode:
      if (!selectedFirstFactor || !(selectedFirstFactor as any).emailAddressId) {
        return null;
      }
      
      return (
        <VerifyEmailCode 
          emailAddress={(selectedFirstFactor as any).safeIdentifier || ""}
          emailAddressId={(selectedFirstFactor as any).emailAddressId}
          onSelectAlternateMethod={() => {
            if (supportedFirstFactors && supportedFirstFactors.length > 1) {
              setFormState(FormState.AlternateFirstFactor);
            }
          }}
          onEditEmailAddress={() => {
            setFormState(FormState.SignIn);
            setSelectedFirstFactor(null);
          }}
          homeUrl={homeUrl}
        />
      );
    
    case FormState.AlternateFirstFactor:
      if (!supportedFirstFactors) {
        return null;
      }
      
      return (
        <AlternateFirstFactors 
          factors={supportedFirstFactors}
          onSelectFactor={(factor) => {
            setSelectedFirstFactor(factor);
            setFormState(FormState.VerifyEmailCode);
          }}
          scheme={scheme}
        />
      );
    
    default:
      return null;
  }
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#757575",
  },
  alternateMethodButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  alternateMethodText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
});

export default SignIn;
