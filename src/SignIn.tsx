import { useSignIn } from "@clerk/clerk-expo";
import { SignInFirstFactor } from "@clerk/types";
import React, { useState } from "react";
import InitialSignInForm from "./forms/InitialSignInForm";
import VerifyEmailCodeForm from "./forms/VerifyEmailCodeForm";
import AlternateFirstFactorsForm from "./forms/AlternateFirstFactorsForm";
import { ActivityIndicator, View } from "react-native";
import EnterPasswordForm from "./forms/EnterPasswordForm";
import ForgotPasswordForm from "./forms/ForgotPasswordForm";
import NewPasswordForm from "./forms/NewPasswordForm";


// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}

enum FormState {
  SignIn,
  VerifyFirstFactor,
  AlternateFirstFactor,
  SecondFactor,
  ForgotPassword,
  NewPasswordNeeded,
  Done
}

interface SignInProps {
  scheme?: string;
  signUpUrl?: string;
  homeUrl?: string;
}

export function SignIn({ scheme = "myapp://", signUpUrl = "/(auth)/sign-up", homeUrl = "/" }: SignInProps) {
  const router = Router.useRouter();
  const { isLoaded, setActive } = useSignIn();

  const [supportedFirstFactors, setSupportedFirstFactors] = useState<SignInFirstFactor[]>(  );
  const [formState, setFormState] = useState<FormState>(FormState.SignIn);
  const [selectedFirstFactor, setSelectedFirstFactor] = useState<SignInFirstFactor>();
  const [identifier, setIdentifier] = useState("");

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  async function onSignInComplete(sessionId: string) {
    if (!setActive) {
      return;
    }
    await setActive({
      session: sessionId,
    });
    router.replace(homeUrl);
  }

  switch (formState) {
    case FormState.SignIn:
      return (
        <InitialSignInForm 
          onSetFirstFactor={(factor, identifier) => {
            setSelectedFirstFactor(factor);
            setFormState(FormState.VerifyFirstFactor);
            setIdentifier(identifier)
          }}
          onSetSupportedFirstFactors={setSupportedFirstFactors}
          scheme={scheme}
          signUpUrl={signUpUrl}
          onSessionAlreadyExists={() => {
            router.replace(homeUrl)
          }}
        />
      );
    
    case FormState.VerifyFirstFactor:
      if(selectedFirstFactor?.strategy == "email_code" || selectedFirstFactor?.strategy == "reset_password_email_code") {
        return (
          <VerifyEmailCodeForm 
            emailAddress={(selectedFirstFactor as any).safeIdentifier || ""}
            onSelectAlternateMethod={() => {
              if (supportedFirstFactors && supportedFirstFactors.length > 1) {
                setFormState(FormState.AlternateFirstFactor);
              }
            }}
            onEditEmailAddress={() => {
              setFormState(FormState.SignIn);
              setSelectedFirstFactor(undefined);
            }}
            selectedFactor={selectedFirstFactor}
            onNewPasswordNeeded={() => {
              setFormState(FormState.NewPasswordNeeded);
            }}
            onSignInComplete={onSignInComplete}
          />
        )
      } 
      if(selectedFirstFactor?.strategy == "password") {
        return (
          <EnterPasswordForm 
            emailAddress={identifier}
            onSelectAlternateMethod={() => {
              if (supportedFirstFactors && supportedFirstFactors.length > 1) {
                setFormState(FormState.AlternateFirstFactor);
              }
            }}
            onEditEmailAddress={() => {
              setFormState(FormState.SignIn);
              setSelectedFirstFactor(undefined);
            }}
            onForgotPasswordPressed={() => {
              setFormState(FormState.ForgotPassword);
            }}
            onSignInComplete={onSignInComplete}
          />
        )
      } 
      return null
    
    case FormState.ForgotPassword:
      return (
        <ForgotPasswordForm scheme={scheme}
          selectedFactor={selectedFirstFactor}
          factors={supportedFirstFactors}
          onSelectFactor={(factor) => {
            setSelectedFirstFactor(factor);
            setFormState(FormState.VerifyFirstFactor);
          }}
          onBackPress={() => {
            setFormState(FormState.SignIn);
            setSelectedFirstFactor(undefined);
          }} />
      )

    case FormState.NewPasswordNeeded:
      return (
        <NewPasswordForm 
          onBackPressed={() => {
            setFormState(FormState.SignIn);
            setSelectedFirstFactor(undefined);
          }}
          onSignInComplete={onSignInComplete} />
      )
    
    case FormState.AlternateFirstFactor:
      if (!supportedFirstFactors) {
        return null;
      }
      
      return (
        <AlternateFirstFactorsForm 
          factors={supportedFirstFactors}
          onSelectFactor={(factor) => {
            setSelectedFirstFactor(factor);
          }}
          scheme={scheme}
          onBackPress={() => {
            setFormState(FormState.VerifyFirstFactor);
          }}
          selectedFactor={selectedFirstFactor}
        />
      );
    
    default:
      return null;
  }
}

export default SignIn;
