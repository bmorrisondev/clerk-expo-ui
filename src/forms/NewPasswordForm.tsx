import React, { useState } from 'react'
import Form from '../components/Form'
import Input from '../components/Input'
import Button from '../components/Button'
import TextButton from '../components/TextButton'
import ErrorText from '../components/ErrorText'
import { useSignIn } from "@clerk/clerk-expo";
import { Switch, View, Text } from "react-native";

interface NewPasswordFormProps {
  onBackPressed: () => void
  onSignInComplete: (sessionId: string) => void
}

function NewPasswordForm({ onBackPressed, onSignInComplete }: NewPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [signOutOfOtherSessions, setSignOutOfOtherSessions] = useState(false);

  const { signIn } = useSignIn();

  async function onResetPasswordPressed() {
    try {
      const res = await signIn?.resetPassword({
        password,
        signOutOfOtherSessions,
      })
      if (res?.createdSessionId) {
        onSignInComplete(res.createdSessionId)
      }
    } catch (err: any) {
      console.error('signInError', JSON.stringify(err, null, 2))
      const { errors } = err
      setErrorMessage(errors[0].message)
    }
  }

  return (
    <Form
      title="Set new password"
    >
      <Input
        label="New password"
        autoCapitalize="none"
        value={password}
        onChangeText={(password) => setPassword(password)}
        paramName="password"
        secureTextEntry
      />
    <Input
        label="Confirm password"
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
        paramName="password"
        secureTextEntry
    />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 16 }}>Sign out of other sessions</Text>
        <View style={{ flex: 1 }} />
        <Switch
          onValueChange={(value) => setSignOutOfOtherSessions(value)}
          value={signOutOfOtherSessions}
        />
      </View>

    <ErrorText message={errorMessage} />
    <Button
      variant="secondary"
      onPress={onResetPasswordPressed}
      disabled={!password || !confirmPassword}
    >
      Reset password
    </Button>
    <TextButton
      onPress={onBackPressed}
      text="Back"
    />
    </Form>
  )
}

export default NewPasswordForm