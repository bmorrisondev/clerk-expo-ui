import React from 'react'
import Form from '../components/Form'
import Button from '../components/Button'
import { SignInFirstFactor } from "@clerk/types";
import FormDivider from '../components/FormDivider';
import OAuthButtonRow from '../components/OAuthButtonRow';
import AlternateFirstFactors from '../components/AlternateFirstFactors';
import TextButton from '../components/TextButton';
import { useSignIn } from "@clerk/clerk-expo";

interface Props {
    scheme?: string
    selectedFactor?: SignInFirstFactor
    factors?: SignInFirstFactor[]
    onSelectFactor: (factor: SignInFirstFactor) => void
    onBackPress: () => void
}

function ForgotPasswordForm({ scheme = "myapp://", selectedFactor, factors, onSelectFactor, onBackPress }: Props) {
const { signIn } = useSignIn();

  async function onResetPasswordPressed() {
    const factor = factors?.find(f => f.strategy === 'reset_password_email_code')
    if (!factor) {
      return
    }
    try {
        await signIn?.prepareFirstFactor({
            // @ts-ignore
            strategy: factor?.strategy,
            // @ts-ignore
            emailAddressId: factor?.emailAddressId,
        })
        onSelectFactor(factor)
    } catch (err: any) {
        console.error('signInError', JSON.stringify(err, null, 2));
    }
  }

  return (
    <Form title="Forgot password?" subtitle="">
        <Button variant="secondary" onPress={() => onResetPasswordPressed()} style={{ marginBottom: 16 }}>
            Reset your password
        </Button>
        <FormDivider title="Or, sign in with another method" />
        <OAuthButtonRow scheme={scheme} />
        {factors && (
            <AlternateFirstFactors 
                factors={factors}
                onSelectFactor={onSelectFactor}
                selectedFactor={selectedFactor}
            />
        )}
        <TextButton 
            onPress={onBackPress}
            text="Back"
        />
    </Form>
  )
}

export default ForgotPasswordForm