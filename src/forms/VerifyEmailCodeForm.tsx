import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { EnvironmentResource, SignInFirstFactor } from "@clerk/types";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import OTPInput from "../components/OTPInput";
import ContinueButton from "../components/ContinueButton";
import Form from "../components/Form";

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}

interface VerifyEmailCodeProps {
  emailAddress: string
  onSelectAlternateMethod: () => void
  onEditEmailAddress: () => void
  selectedFactor?: SignInFirstFactor
  onNewPasswordNeeded: () => void
  onSignInComplete: (sessionId: string) => void
}

function VerifyEmailCodeForm({ 
  emailAddress, 
  onSelectAlternateMethod, 
  onEditEmailAddress,
  onNewPasswordNeeded,
  onSignInComplete,
  selectedFactor
}: VerifyEmailCodeProps) {

  const router = Router.useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const clerk = useClerk()

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource

  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const formTitle = selectedFactor?.strategy === 'phone_code' ? `Check your phone number` :
    selectedFactor?.strategy === 'reset_password_email_code' ? `Reset password` : 
    `Check your email`;
  const formSubtitle = selectedFactor?.strategy === 'reset_password_email_code' ? `First, enter the code sent to your email address` : 
    `to continue to ${environment.displayConfig.applicationName}`;
  
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
        // @ts-ignore
        strategy: selectedFactor?.strategy,
        // @ts-ignore
        emailAddressId: selectedFactor?.emailAddressId,
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
        // @ts-ignore
        strategy: selectedFactor?.strategy,
        code: code
      })

      console.log('completeSignIn', JSON.stringify(completeSignIn, null, 2))

      switch (completeSignIn.status) {
        case "complete":
          onSignInComplete(completeSignIn.createdSessionId!)
          break;
        case "needs_new_password":
          onNewPasswordNeeded()
          break;
        default:
          console.error('signInAttempt', JSON.stringify(completeSignIn, null, 2));
          break;
      }
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2));
    }
  }

  const headerChildren: ReactNode = (
    <TouchableOpacity
      onPress={onEditEmailAddress}
      style={styles.emailAddressContainer}
    >
      <Text style={styles.emailAddressText}>
        {emailAddress} <Ionicons name="pencil-outline" size={16} color="#5e41f7" />
      </Text>
    </TouchableOpacity>
  )

  return (
    <Form 
      title={formTitle} 
      subtitle={formSubtitle} 
      headerChildren={headerChildren}
    >
      <OTPInput
        value={code}
        onChange={(code) => setCode(code)}
      />

      <TouchableOpacity
        onPress={onResendPressed}
        style={[styles.resendCodeButton, !canResend && styles.disabledButton]}
        disabled={!canResend}
      >
        <Text style={[styles.switchModeText, !canResend && styles.disabledText]}>
          Didn't receive a code? {canResend ? "Resend" : `Resend (${resendTimer})`}
        </Text>
      </TouchableOpacity>
      
      <ContinueButton
        onPress={onContinuePressed}
        disabled={!code || !isLoaded || !signIn}
      >
        Continue
      </ContinueButton>

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

export default VerifyEmailCodeForm

const styles = StyleSheet.create({
  emailAddressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emailAddressText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
  resendCodeButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    marginBottom: 24,
    color: "#5e41f7",
  },
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 8,
    color: "#5e41f7",
  },
  switchModeText: {
    fontSize: 16,
    color: "#5e41f7",
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
    color: "#5e41f7",
    fontWeight: "500",
  },
});