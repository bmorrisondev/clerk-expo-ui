import { useState } from 'react'
import Form from '../components/Form'
import { useClerk, useSignUp } from "@clerk/clerk-expo";
import { EnvironmentResource, SignInFirstFactor } from "@clerk/types";
import OAuthButtonRow from "../components/OAuthButtonRow";
import Input from '../components/Input';
import ContinueButton from '../components/ContinueButton';
import { TouchableOpacity } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import ErrorText from '../components/ErrorText';
import FormDivider from '../components/FormDivider';
import TextButton from '../components/TextButton';

// Safely import expo-router
let Router: any = { useRouter: () => ({ replace: () => {} }) };
try {
  Router = require("expo-router");
} catch (error) {
  console.warn('expo-router import failed:', error);
}

interface Props {
  onContinue: (emailAddress: string) => void
  scheme?: string
  signInUrl?: string
}

function InitialSignUpForm({
  onContinue,
  scheme = "catalyst://",
  signInUrl = "/(auth)"
}: Props) {
  const clerk = useClerk();
  const router = Router.useRouter();
  const { signUp, isLoaded } = useSignUp();
  const [errorMessage, setErrorMessage] = useState("");
  const [erroredParams, setErroredParams] = useState<string[]>([])

  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource;

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  async function onContinuePressed() {
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
      onContinue(emailAddress);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setErrorMessage(err.errors[0].message);
      setErroredParams(err.errors.map((error: any) => error.meta.paramName));
    }
  }

  return (
    <Form title={`Create Your ${environment.displayConfig.applicationName} Account`} subtitle="Welcome! Please fill in the details to get started.">
      <OAuthButtonRow scheme={scheme} showDivider={true} />

        <Input
            label="Email address"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={(email: string) => setEmailAddress(email)}
            placeholder="Enter your email"
            paramName="email_address"
            error={erroredParams.includes("email_address") ? errorMessage : undefined}
        />
        <Input
            label="Password"
            value={password}
            secureTextEntry={true}
            onChangeText={(password: string) => setPassword(password)}
            placeholder="Create a password"
            paramName="password"
            error={erroredParams.includes("password") ? errorMessage : undefined}
        />

        <ErrorText message={errorMessage} />

        <ContinueButton onPress={onContinuePressed} disabled={!emailAddress || !password} />

        <TextButton
            onPress={() => router.replace(signInUrl)}
            text="Already have an account? Sign in"
        />
    </Form>
  )
}

export default InitialSignUpForm