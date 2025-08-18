/**
 * MobileNumberInput Component (wrapper)
 *
 * Re-implemented using react-native-phone-number-input for robust parsing,
 * validation, and a built-in country picker. Keeps the same external props.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import PhoneInput from 'react-native-phone-number-input';
import type { CountryCode } from 'react-native-country-picker-modal';
import { Colors } from '../constants';

interface MobileNumberInputProps {
  value?: string; // Full number with country code (e.g., "+1234567890")
  onChangeText?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  style?: any;
}

// Minimal mapping to infer default country from an incoming E.164 value
const DIAL_CODE_TO_COUNTRY: Array<{ code: CountryCode; dial: string }> = [
  { code: 'US', dial: '+1' },
  { code: 'CA', dial: '+1' },
  { code: 'GB', dial: '+44' },
  { code: 'AU', dial: '+61' },
  { code: 'DE', dial: '+49' },
  { code: 'FR', dial: '+33' },
  { code: 'IT', dial: '+39' },
  { code: 'ES', dial: '+34' },
  { code: 'NL', dial: '+31' },
  { code: 'BR', dial: '+55' },
  { code: 'MX', dial: '+52' },
  { code: 'IN', dial: '+91' },
  { code: 'CN', dial: '+86' },
  { code: 'JP', dial: '+81' },
  { code: 'KR', dial: '+82' },
  { code: 'SG', dial: '+65' },
  { code: 'ZA', dial: '+27' },
  { code: 'NG', dial: '+234' },
  { code: 'KE', dial: '+254' },
  { code: 'GH', dial: '+233' },
];

const inferCountryFromValue = (val?: string): CountryCode => {
  if (!val) return 'US';
  const m = DIAL_CODE_TO_COUNTRY.find((c) => val.startsWith(c.dial));
  return (m?.code || 'US') as CountryCode;
};

const stripDialCode = (val?: string): string => {
  if (!val) return '';
  const match = DIAL_CODE_TO_COUNTRY.find((c) => val.startsWith(c.dial));
  if (match) return val.slice(match.dial.length);
  // If already no + prefix, return as-is (component will format)
  return val.replace(/^\+/, '');
};

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter mobile number',
  error,
  disabled = false,
  style,
}) => {
  const phoneRef = React.useRef<PhoneInput>(null);
  const [defaultCode, setDefaultCode] = React.useState<CountryCode>(inferCountryFromValue(value));
  const [raw, setRaw] = React.useState<string>(stripDialCode(value));

  // Keep internal state in sync when parent value changes
  React.useEffect(() => {
    setDefaultCode(inferCountryFromValue(value));
    setRaw(stripDialCode(value));
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <PhoneInput
        ref={phoneRef}
        defaultCode={defaultCode}
        value={raw}
        onChangeText={(text) => {
          setRaw(text);
        }}
        onChangeFormattedText={(formatted) => {
          // formatted comes as E.164 (+<country><number>) when valid
          onChangeText?.(formatted);
        }}
        placeholder={placeholder}
        disabled={disabled}
        layout="first"
        textInputProps={{
          placeholderTextColor: Colors.text.secondary,
          editable: !disabled,
        }}
        containerStyle={[
          styles.inputContainer,
          { borderColor: error ? Colors.error.main : Colors.border.primary },
          disabled && styles.disabledContainer,
        ]}
        textContainerStyle={styles.textContainer}
        codeTextStyle={styles.codeText}
        textInputStyle={styles.textInput}
        flagButtonStyle={styles.flagButton}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderRadius: 4,
  },
  textContainer: {
    backgroundColor: Colors.background.secondary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  textInput: {
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  codeText: {
    color: Colors.text.primary,
  },
  flagButton: {
    paddingLeft: 8,
  },
  disabledContainer: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.secondary,
  },
  errorText: {
    color: Colors.error.main,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default MobileNumberInput;
