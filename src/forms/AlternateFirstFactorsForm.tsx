import { SignInFirstFactor } from "@clerk/types";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import OAuthButtonRow from "../components/OAuthButtonRow";
import Form from "../components/Form";
import TextButton from "../components/TextButton";
import AlternateFirstFactors from "../components/AlternateFirstFactors";

interface AlternateFirstFactorsProps {
  factors: SignInFirstFactor[]
  onSelectFactor: (factor: SignInFirstFactor) => void
  onBackPress: () => void
  scheme?: string
  selectedFactor?: SignInFirstFactor
}

function AlternateFirstFactorsForm({ 
  factors, 
  onSelectFactor,
  onBackPress,
  scheme = "myapp://",
  selectedFactor
}: AlternateFirstFactorsProps) {  
  return (
    <Form title="Use another method" subtitle="Facing issues? You can use any of these methods to sign in.">
      <OAuthButtonRow scheme={scheme} />
      
      <AlternateFirstFactors 
        factors={factors}
        onSelectFactor={onSelectFactor}
        selectedFactor={selectedFactor}
      />

      <TextButton 
        onPress={onBackPress}
        text="Back"
      />
    </Form>
  )
}

export default AlternateFirstFactorsForm

