/**
 * PasscodeInput Component
 * 
 * A customizable passcode/OTP input component that displays individual boxes
 * for each digit. Features include:
 * - Individual input boxes for each digit
 * - Auto-focus to next box on input
 * - Auto-focus to previous box on backspace
 * - Customizable length (4, 6, 8 digits)
 * - Beautiful dark theme design
 * - Accessibility support
 * - TypeScript support
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';

interface PasscodeInputProps {
  /** Length of the passcode (default: 6) */
  length?: number;
  /** Callback when passcode is complete */
  onComplete?: (code: string) => void;
  /** Callback when passcode changes */
  onCodeChange?: (code: string) => void;
  /** Whether to mask the input (show dots instead of numbers) */
  masked?: boolean;
  /** Custom error message */
  error?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Auto focus the first input on mount */
  autoFocus?: boolean;
}

/**
 * PasscodeInput Component
 * 
 * Renders individual input boxes for passcode/OTP entry
 */
const PasscodeInput: React.FC<PasscodeInputProps> = ({
  length = 6,
  onComplete,
  onCodeChange,
  masked = false,
  error,
  disabled = false,
  autoFocus = true,
}) => {
  // State to store each digit
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  
  // Refs for each input box
  const inputRefs = useRef<TextInput[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus, disabled]);

  // Handle text change for individual input
  const handleTextChange = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Take only the last character if multiple are entered
    const digit = numericText.slice(-1);
    
    // Update the code array
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    
    // Call onCodeChange callback
    const codeString = newCode.join('');
    onCodeChange?.(codeString);
    
    // Auto-focus next input if digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Call onComplete if all digits are filled
    if (codeString.length === length && onComplete) {
      Keyboard.dismiss();
      onComplete(codeString);
    }
  };

  // Handle key press (for backspace functionality)
  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // If current box is empty and backspace is pressed, focus previous box
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle box press (focus the input)
  const handleBoxPress = (index: number) => {
    if (!disabled) {
      inputRefs.current[index]?.focus();
    }
  };

  // Clear all inputs
  const clearInputs = () => {
    setCode(Array(length).fill(''));
    onCodeChange?.('');
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length }, (_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.inputBox,
              code[index] ? styles.filledBox : styles.emptyBox,
              error ? styles.errorBox : null,
              disabled ? styles.disabledBox : null,
            ]}
            onPress={() => handleBoxPress(index)}
            disabled={disabled}
          >
            <TextInput
              ref={(ref) => {
                if (ref) {
                  inputRefs.current[index] = ref;
                }
              }}
              style={[
                styles.input,
                disabled ? styles.disabledInput : null,
              ]}
              value={masked && code[index] ? '•' : code[index]}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!disabled}
              secureTextEntry={false} // We handle masking manually
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode" // iOS autofill support
            />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Error message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {/* Clear button for development/testing */}
      {__DEV__ && (
        <TouchableOpacity onPress={clearInputs} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear (Dev)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  inputBox: {
    width: 50,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  emptyBox: {
    borderColor: Colors.border.primary,
  },
  filledBox: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.primary,
  },
  errorBox: {
    borderColor: '#ef4444',
  },
  disabledBox: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.secondary,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    backgroundColor: 'transparent',
  },
  disabledInput: {
    color: Colors.text.disabled,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  // Development helper styles
  clearButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 6,
  },
  clearButtonText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
});

export default PasscodeInput;