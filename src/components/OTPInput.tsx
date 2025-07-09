import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  error,
  label,
}: Props) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Initialize the refs array based on length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    while (inputRefs.current.length < length) {
      inputRefs.current.push(null);
    }
  }, [length]);

  // Focus on the first empty input or the last input if all filled
  useEffect(() => {
    const valueArray = value.split('');
    const indexToFocus = Math.min(valueArray.length, length - 1);
    
    if (inputRefs.current[indexToFocus]) {
      inputRefs.current[indexToFocus]?.focus();
    }
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const newValue = value.split('');
    
    // Handle digit input
    if (/^\d*$/.test(text)) {
      if (text.length === 0) {
        // Backspace was pressed
        newValue[index] = '';
        onChange(newValue.join(''));
        
        // Move focus to previous input if not at the first input
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // New digit entered
        const lastChar = text.charAt(text.length - 1);
        newValue[index] = lastChar;
        onChange(newValue.join(''));
        
        // Move focus to next input if not at the last input
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !value[index]) {
      // If backspace is pressed on an empty input, move focus to previous input
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              error ? styles.inputError : null,
              focusedIndex === index ? styles.inputFocused : null,
            ]}
            value={value[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            maxLength={1}
            keyboardType="number-pad"
            selectTextOnFocus
            autoCapitalize="none"
          />
        ))}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  input: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: '#5a3df7',
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
});

export default OTPInput;
