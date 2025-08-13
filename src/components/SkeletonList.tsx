import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors } from '../constants';

interface SkeletonListProps {
  count?: number;
}

const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3 }) => {
  return (
    <SkeletonPlaceholder
      backgroundColor={Colors.background.secondary}
      highlightColor={Colors.background.tertiary}
    >
      <View>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={{ marginBottom: 16, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ width: '70%', height: 20, borderRadius: 4 }} />
                <View style={{ marginTop: 6, width: '40%', height: 14, borderRadius: 4 }} />
              </View>
              <View style={{ width: 60, height: 30, borderRadius: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );
};

export default SkeletonList;
