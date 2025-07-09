import { useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import InitialSignUpForm from './forms/InitialSignUpForm';
import VerifyEmailCodeSignUpForm from './forms/VerifyEmailCodeSignUpForm';

enum FormState {
  SignIn,
  VerifyEmailCode,
}

interface Props {
  scheme?: string;
  signInUrl?: string;
  homeUrl?: string;
}

export function SignUp({ scheme = "catalystapp", signInUrl = "/(auth)", homeUrl = "/" }: Props) {
  const { isLoaded } = useSignUp();
  const [formState, setFormState] = useState<FormState>(FormState.SignIn);
  const [emailAddress, setEmailAddress] = useState('');

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  switch(formState) {
    case FormState.SignIn:
      return (
        <InitialSignUpForm 
          onContinue={(emailAddress: string) => {
            setEmailAddress(emailAddress);
            setFormState(FormState.VerifyEmailCode);
          }}
          scheme={scheme}
          signInUrl={signInUrl}
        />
      );
    case FormState.VerifyEmailCode:
      return (
        <VerifyEmailCodeSignUpForm 
          emailAddress={emailAddress}
          onEditEmailAddress={() => {
            setFormState(FormState.SignIn);
          }}
          homeUrl={homeUrl}
        />
      );
    default:
      return null;
  }
}

export default SignUp;
