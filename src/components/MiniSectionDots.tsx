import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants';

interface Props {
  total: number; // total number of dots
  active: number; // zero-based index of active dot
  style?: any;
  size?: number; // optional custom size
}

const MiniSectionDots: React.FC<Props> = ({ total, active, style, size = 8 }) => {
  const dots = Array.from({ length: total });
  return (
    <View style={[styles.row, style]}> 
      {dots.map((_, i) => (
        <View
          key={i}
          accessibilityRole="text"
          accessibilityLabel={`Progress dot ${i + 1} of ${total}${i === active ? ', current step' : ''}`}
          style={[
            styles.dot,
            { width: size, height: size, borderRadius: size / 2 },
            i === active && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
  dot: { backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white },
});

export default MiniSectionDots;
