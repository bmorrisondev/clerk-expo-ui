import { useAuth } from "@clerk/clerk-expo";
import { Button } from "./components/Button";

interface Props {
  redirectUrl?: string;
}

export function SignOutButton({ redirectUrl = "/" }: Props) {
  const { signOut } = useAuth();

  async function onSignOutPress() {
    try {
      await signOut({
        // @ts-ignore - redirectUrl is supported but not in the type definitions
        redirectUrl
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <Button onPress={onSignOutPress}>
      Sign out
    </Button>
  );
}

export default SignOutButton;
