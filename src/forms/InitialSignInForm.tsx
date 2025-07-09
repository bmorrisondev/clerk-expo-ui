import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { EnvironmentResource, OAuthStrategy, SignInFirstFactor } from "@clerk/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Input from "../components/Input";
import OAuthButton from "../components/OAuthButton";
import ContinueButton from "../components/ContinueButton";
import ErrorText from "../components/ErrorText";
import Form from "../components/Form";
import FormDivider from "../components/FormDivider";
import OAuthButtonRow from "../components/OAuthButtonRow";
import TextButton from "../components/TextButton";

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}

interface InitialSignInFormProps {
  onSetFirstFactor: (firstFactor: SignInFirstFactor, identifier: string) => void
  onSetSupportedFirstFactors: (firstFactors: SignInFirstFactor[]) => void
  scheme?: string
  signUpUrl?: string
  onSessionAlreadyExists?: () => void
}

export function InitialSignInForm({ 
  onSetFirstFactor, 
  onSetSupportedFirstFactors,
  scheme = "catalyst://",
  signUpUrl = "/(auth)/sign-up",
  onSessionAlreadyExists
}: InitialSignInFormProps) {
  const router = Router.useRouter();
  const { signIn, isLoaded } = useSignIn();
  const clerk = useClerk()
  
  const [errorMessage, setErrorMessage] = useState("");
  const [erroredParams, setErroredParams] = useState<string[]>([])
  const [identifier, setIdentifier] = useState("");
  const [identifierLabel, setIdentifierLabel] = useState("Email address");
  const [identifierPlaceholder, setIdentifierPlaceholder] = useState("Enter your email");
  
  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource
  
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
      // @ts-ignore TODO: Fix this type issue
      const firstFactor = determineFirstFactor(supportedFirstFactors)
      if(firstFactor.strategy == "email_code" || firstFactor.strategy == "reset_password_email_code") {
        await signInAttempt.prepareFirstFactor({
          // @ts-ignore
          strategy: firstFactor.strategy,
          // @ts-ignore
          emailAddressId: firstFactor.emailAddressId,
        })
      }
      onSetFirstFactor(firstFactor, identifier)
      // @ts-ignore TODO: Fix this type issue
      onSetSupportedFirstFactors(supportedFirstFactors)
    } catch (err: any) {
      const { errors } = err
      if (errors[0].code == "session_exists") {
        // TODO: Figure out how to handle this
        return;
      }
      console.error('signInError', JSON.stringify(err, null, 2))
      setErrorMessage(errors[0].message)
      setErroredParams(errors.map((e: any) => e?.meta?.paramName))
    }
  }
  
  function determineFirstFactor(supportedFirstFactors: SignInFirstFactor[]): SignInFirstFactor {
    console.log(JSON.stringify(supportedFirstFactors, null, 2))
    return supportedFirstFactors[0]
  }
  
  return (
    <Form title={`Sign in to ${environment.displayConfig.applicationName}`} subtitle="Welcome back! Please sign in to continue">
      <OAuthButtonRow scheme={scheme} showDivider={true} />
    
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

      <TextButton
        onPress={() => router.replace(signUpUrl)}
        text="Don&apos;t have an account? Sign up"
      />
    </Form>
  )
}

export default InitialSignInForm

const styles = StyleSheet.create({
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 8,
  },
  switchModeText: {
    fontSize: 16,
    color: "#5e41f7",
    fontWeight: "500",
  },
});