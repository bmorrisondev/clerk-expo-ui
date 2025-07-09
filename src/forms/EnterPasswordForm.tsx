import Form from '../components/Form'
import Input from '../components/Input'
import ContinueButton from '../components/ContinueButton'
import ErrorText from '../components/ErrorText'
import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { EnvironmentResource } from "@clerk/types";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";  
import TextButton from '../components/TextButton';

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}


interface Props {
    emailAddress: string;
    onSelectAlternateMethod: () => void;
    onEditEmailAddress: () => void;
    onSignInComplete: (sessionId: string) => void;
    onForgotPasswordPressed: () => void;
}

function EnterPasswordForm({
    emailAddress,
    onSelectAlternateMethod,
    onEditEmailAddress,
    onSignInComplete,
    onForgotPasswordPressed
}: Props) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [erroredParams, setErroredParams] = useState<string[]>([])

  const { signIn } = useSignIn();

  async function onContinuePressed() {
    if (!password || !emailAddress || !signIn) {
      return;
    }
    
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        onSignInComplete(signInAttempt.createdSessionId!)
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2))
      const { errors } = err
      setErrorMessage(errors[0].message)
      setErroredParams(errors.map((e: any) => e?.meta?.paramName))
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
    <Form title="Enter your password" subtitle="Enter the password associated with your account" headerChildren={headerChildren}>
      <Input
        label="Password"
        autoCapitalize="none"
        value={password}
        onChangeText={(password) => setPassword(password)}
        placeholder="Enter your password"
        paramName="password"
        secureTextEntry
        error={erroredParams.includes("password") ? errorMessage : undefined}
        alternateAction={{
          text: "Forgot password?",
          onPress: onForgotPasswordPressed
        }}
      />
      <ErrorText message={errorMessage} />
      <ContinueButton onPress={onContinuePressed} disabled={!password} />
      <TextButton onPress={onSelectAlternateMethod} text="Use another method" />
    </Form>
  )
}

export default EnterPasswordForm

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