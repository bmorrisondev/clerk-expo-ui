// @ts-ignore - Ignoring missing type declarations for @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import TextButton from './TextButton';

interface AlternateAction {
  text: string;
  onPress: () => void;
}

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  paramName?: string;
  alternateAction?: AlternateAction
}

export function Input({ label, error, paramName, alternateAction, ...props }: Props) {
  return (
    <View style={styles.container}>
      {(label || alternateAction) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {alternateAction && <Text onPress={alternateAction.onPress} style={styles.alternateActionText}>{alternateAction.text}</Text>}
        </View>
      )}
      <TextInput 
        style={[styles.input, error ? styles.inputError : null]} 
        placeholderTextColor="#A0A0A0"
        {...props}
      />
      {/* {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )} */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#d34742',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 4,
  },
  alternateActionText: {
    color: '#5e41f7',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default Input;
