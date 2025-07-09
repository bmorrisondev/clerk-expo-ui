import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  children: React.ReactNode | string;
}

export function Button({ children, ...props }: Props) {
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      activeOpacity={0.9}
      {...props}
    >
      {typeof(children) === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
});

export default Button;
