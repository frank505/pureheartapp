/**
 * MobileNumberInput Component
 * 
 * A component for entering mobile numbers with country code selection.
 * Features include:
 * - Country code picker with common countries
 * - Phone number formatting
 * - Validation
 * - TypeScript support
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Text as RNText,
} from 'react-native';
import { Text, TextInput, Surface } from 'react-native-paper';
import { Colors } from '../constants';
import Icon from './Icon';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface MobileNumberInputProps {
  value?: string; // Full number with country code (e.g., "+1234567890")
  onChangeText?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  style?: any;
}

// Common countries with their codes
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
];

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  value = '',
  onChangeText,
  placeholder = 'Enter mobile number',
  error,
  disabled = false,
  style,
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to US
  const [phoneNumber, setPhoneNumber] = useState('');

  // Parse existing value on mount
  React.useEffect(() => {
    if (value) {
      // Try to parse the existing value
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dialCode.length));
      } else {
        // If no country code found, assume it's just the number
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Update the full number
    const fullNumber = country.dialCode + phoneNumber;
    onChangeText?.(fullNumber);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-numeric characters except spaces and dashes
    const cleanText = text.replace(/[^\d\s\-]/g, '');
    setPhoneNumber(cleanText);
    
    // Update the full number
    const fullNumber = selectedCountry.dialCode + cleanText.replace(/[\s\-]/g, '');
    onChangeText?.(fullNumber);
  };

  const formatPhoneNumber = (text: string) => {
    // Simple formatting for US/CA numbers
    if (selectedCountry.dialCode === '+1' && text.length >= 10) {
      const cleaned = text.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return text;
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        {/* Country Code Selector */}
        <TouchableOpacity
          style={[
            styles.countrySelector,
            disabled && styles.disabledSelector,
            error && styles.errorSelector,
          ]}
          onPress={() => !disabled && setShowCountryPicker(true)}
          disabled={disabled}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={[styles.dialCode, disabled && styles.disabledText]}>
            {selectedCountry.dialCode}
          </Text>
          <Icon 
            name="chevron-down-outline" 
            color={disabled ? Colors.text.tertiary : Colors.text.secondary} 
            size="sm" 
          />
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          mode="outlined"
          value={formatPhoneNumber(phoneNumber)}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          editable={!disabled}
          error={!!error}
          style={styles.phoneInput}
          contentStyle={[
            styles.phoneInputContent,
            disabled && styles.disabledText,
          ]}
          outlineStyle={[
            styles.phoneInputOutline,
            error && styles.errorOutline,
          ]}
          theme={{
            colors: {
              onSurfaceVariant: Colors.text.secondary,
              outline: error ? Colors.error.main : Colors.border.primary,
              primary: Colors.primary.main,
              surface: Colors.background.secondary,
              onSurface: Colors.text.primary,
            }
          }}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity 
                onPress={() => setShowCountryPicker(false)}
                style={styles.closeButton}
              >
                <Icon name="close-outline" color={Colors.text.primary} size="md" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={COUNTRIES}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              style={styles.countryList}
              showsVerticalScrollIndicator={false}
            />
          </Surface>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.background.secondary,
    gap: 6,
    minWidth: 100,
  },
  disabledSelector: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.secondary,
  },
  errorSelector: {
    borderColor: Colors.error.main,
  },
  countryFlag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  disabledText: {
    color: Colors.text.tertiary,
  },
  phoneInput: {
    flex: 1,
  },
  phoneInputContent: {
    color: Colors.text.primary,
  },
  phoneInputOutline: {
    borderColor: Colors.border.primary,
  },
  errorOutline: {
    borderColor: Colors.error.main,
  },
  errorText: {
    color: Colors.error.main,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  countryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});

export default MobileNumberInput;
