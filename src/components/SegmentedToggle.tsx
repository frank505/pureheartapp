import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  value: T;
  onChange: (val: T) => void;
  options: Array<SegmentedOption<T>>;
  containerStyle?: ViewStyle;
  pillStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  containerStyle,
  pillStyle,
  labelStyle,
}: SegmentedToggleProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}> 
      {options.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => !active && onChange(opt.value)}
            style={[styles.pill, active && styles.pillActive, pillStyle]}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, active && styles.labelActive, labelStyle]} numberOfLines={1}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: 4,
    borderRadius: 28,
    gap: 4,
  },
  pill: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primary.main,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SegmentedToggle;