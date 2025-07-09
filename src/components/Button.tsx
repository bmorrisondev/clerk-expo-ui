import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props extends TouchableOpacityProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode | string;
}

export function Button({ children, variant = "primary", ...props }: Props) {
  return (
    <TouchableOpacity
      style={props.style || styles.buttonContainer}
      activeOpacity={0.9}
      {...props}
    >
      {variant === "secondary" ? (
        <LinearGradient
          colors={['#6d53f8', '#5c40f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.secondaryWrapper}
        >
        {typeof(children) === 'string' ? <Text style={styles.secondaryText}>{children}</Text> : children}
        </LinearGradient>
      ) : (
        typeof(children) === 'string' ? <Text>{children}</Text> : children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  secondaryWrapper: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  secondaryText: {
    color: '#fbfaff'
  }
});

export default Button;
