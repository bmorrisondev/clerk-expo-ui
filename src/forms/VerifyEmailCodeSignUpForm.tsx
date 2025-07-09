import { useClerk, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { EnvironmentResource } from "@clerk/types";
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

interface Props {
  emailAddress: string
  onEditEmailAddress: () => void
  homeUrl?: string
}

function VerifyEmailCodeSignUpForm({ 
  emailAddress, 
  onEditEmailAddress,
  homeUrl = "/"
}: Props) {

  const router = Router.useRouter();

    const { signUp, isLoaded, setActive } = useSignUp();
  
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
    if (!isLoaded || !signUp) {
      return
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onContinuePressed() {
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
      title={`Verify your email`} 
      subtitle={`Enter the verification code sent to your email`} 
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
        disabled={!code || !isLoaded || !signUp}
      >
        Continue
      </ContinueButton>
    </Form>
  )
}

export default VerifyEmailCodeSignUpForm

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