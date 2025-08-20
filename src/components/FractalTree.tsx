import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Line, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface FractalTreeProps {
  level: number;
  maxLevel?: number;
}

const { width } = Dimensions.get('window');
const INITIAL_LENGTH = 120; // Increased initial length
const ANGLE = Math.PI / 5; // 36 degrees
const BARK_COLOR = '#795548'; // Rich brown for trunk and branches
const BARK_HIGHLIGHT = '#8D6E63'; // Lighter brown for highlights
const LEAF_COLOR = '#2E7D32'; // Rich forest green for leaves
const LEAF_DARK = '#1B5E20'; // Darker green for veins and outlines
const LEAF_HIGHLIGHT = '#43A047'; // Lighter green for highlights

interface Branch {
  start: [number, number];
  end: [number, number];
  level: number;
}

interface Leaf {
  x: number;
  y: number;
  angle: number;
  size: number;
}

const FractalTree: React.FC<FractalTreeProps> = ({ level, maxLevel = 8 }) => {
  const normalizedLevel = Math.min(Math.max(level, 0), maxLevel);
  const currentLevelInt = Math.floor(normalizedLevel);
  const levelProgress = normalizedLevel - currentLevelInt;
  
  const drawBranch = (
    startX: number,
    startY: number,
    len: number,
    angle: number,
    currentLevel: number,
    maxLevel: number,
    progress: number = 1
  ): { branches: Branch[]; leaves: Leaf[] } => {
    if (currentLevel <= 0) return { branches: [], leaves: [] };

    // Calculate full length and apply progress for smooth growth
    const fullLen = len * progress;
    const endX = startX + fullLen * Math.sin(angle);
    const endY = startY - fullLen * Math.cos(angle);
    
    const currentBranch = {
      start: [startX, startY] as [number, number],
      end: [endX, endY] as [number, number],
      level: maxLevel - currentLevel + 1,
      progress
    };

    // Add leaves at the end of smaller branches
    const leaves: Leaf[] = [];
    if (currentLevel <= 2) {
      leaves.push({
        x: endX,
        y: endY,
        angle: angle,
        size: len * 0.5
      });
    }

    const nextLevelProgress = currentLevel === currentLevelInt + 1 ? levelProgress : 1;
    
    const left = drawBranch(
      endX,
      endY,
      len * 0.7,
      angle + ANGLE,
      currentLevel - 1,
      maxLevel,
      nextLevelProgress
    );
    
    const right = drawBranch(
      endX,
      endY,
      len * 0.7,
      angle - ANGLE,
      currentLevel - 1,
      maxLevel,
      nextLevelProgress
    );

    return {
      branches: [currentBranch, ...left.branches, ...right.branches],
      leaves: [...leaves, ...left.leaves, ...right.leaves]
    };
  };

  const { branches, leaves } = drawBranch(
    width / 2,
    width * 0.95, // Move starting point lower
    INITIAL_LENGTH * (normalizedLevel / maxLevel),
    0,
    normalizedLevel,
    normalizedLevel
  );

  // Animation values for wind effect
  const windAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startWindAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(windAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(windAnimation, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    startWindAnimation();
    return () => {
      windAnimation.stopAnimation();
    };
  }, []);

  // Function to generate a detailed leaf path
  const getLeafPath = (leaf: Leaf) => {
    const { x, y, angle, size } = leaf;
    const leafWidth = size * 0.6;
    const leafHeight = size;
    
    // Calculate rotated points based on angle
    const rotate = (px: number, py: number) => {
      const s = Math.sin(angle);
      const c = Math.cos(angle);
      const rotatedX = (px * c) - (py * s);
      const rotatedY = (px * s) + (py * c);
      return [x + rotatedX, y + rotatedY];
    };

    // Base point (stem attachment)
    const [baseX, baseY] = [x, y];
    
    // Complex leaf shape with serrated edges and natural curves
    const [tipX, tipY] = rotate(0, -leafHeight);
    
    // Control points for main leaf shape
    const [leftCP1X, leftCP1Y] = rotate(-leafWidth * 0.3, -leafHeight * 0.2);
    const [leftCP2X, leftCP2Y] = rotate(-leafWidth, -leafHeight * 0.5);
    const [leftCP3X, leftCP3Y] = rotate(-leafWidth * 0.7, -leafHeight * 0.8);
    
    const [rightCP1X, rightCP1Y] = rotate(leafWidth * 0.3, -leafHeight * 0.2);
    const [rightCP2X, rightCP2Y] = rotate(leafWidth, -leafHeight * 0.5);
    const [rightCP3X, rightCP3Y] = rotate(leafWidth * 0.7, -leafHeight * 0.8);
    
    // Serrated edge points (left side)
    const numTeeth = 5;
    const teethPoints = [];
    for (let i = 1; i <= numTeeth; i++) {
      const progress = i / (numTeeth + 1);
      const depth = leafWidth * 0.15;
      const toothX = -leafWidth * (0.8 - progress * 0.3);
      const toothY = -leafHeight * progress;
      const [tX, tY] = rotate(toothX, toothY);
      const [tiX, tiY] = rotate(toothX - depth, toothY - depth * 0.5);
      teethPoints.push(`Q ${tiX} ${tiY} ${tX} ${tY}`);
    }
    
    // Serrated edge points (right side)
    const rightTeethPoints = [];
    for (let i = numTeeth; i >= 1; i--) {
      const progress = i / (numTeeth + 1);
      const depth = leafWidth * 0.15;
      const toothX = leafWidth * (0.8 - progress * 0.3);
      const toothY = -leafHeight * progress;
      const [tX, tY] = rotate(toothX, toothY);
      const [tiX, tiY] = rotate(toothX + depth, toothY - depth * 0.5);
      rightTeethPoints.push(`Q ${tiX} ${tiY} ${tX} ${tY}`);
    }
    
    // Combine all points into a natural leaf shape with serrated edges
    return `
      M ${baseX} ${baseY}
      C ${leftCP1X} ${leftCP1Y} ${leftCP2X} ${leftCP2Y} ${leftCP3X} ${leftCP3Y}
      ${teethPoints.join(' ')}
      Q ${tipX} ${tipY} ${tipX} ${tipY}
      ${rightTeethPoints.join(' ')}
      C ${rightCP3X} ${rightCP3Y} ${rightCP2X} ${rightCP2Y} ${rightCP1X} ${rightCP1Y}
      Z
    `;
  };

  // Function to generate leaf veins
  const getLeafVeins = (leaf: Leaf) => {
    const { x, y, angle, size } = leaf;
    const leafHeight = size * 0.8;
    
    const rotate = (px: number, py: number) => {
      const s = Math.sin(angle);
      const c = Math.cos(angle);
      const rotatedX = (px * c) - (py * s);
      const rotatedY = (px * s) + (py * c);
      return [x + rotatedX, y + rotatedY];
    };

    // Create main vein
    const [tipX, tipY] = rotate(0, -leafHeight);
    const mainVein = `M ${x} ${y} L ${tipX} ${tipY}`;
    
    // Create side veins
    const numVeins = 3;
    const veins = [];
    for (let i = 1; i <= numVeins; i++) {
      const height = (leafHeight * i) / (numVeins + 1);
      const width = (size * 0.4) * (1 - i / (numVeins + 1));
      const [centerX, centerY] = rotate(0, -height);
      const [leftX, leftY] = rotate(-width, -height);
      const [rightX, rightY] = rotate(width, -height);
      
      veins.push(`M ${leftX} ${leftY} L ${centerX} ${centerY} L ${rightX} ${rightY}`);
    }
    
    return [mainVein, ...veins].join(' ');
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={width}>
        <G>
          {/* Draw branches with gradient thickness */}
          {branches.map((branch, index) => {
            const thickness = Math.max(12 * (1 - branch.level / (maxLevel + 1)), 2); // Increased base thickness
            return (
              <Line
                key={`branch-${index}`}
                x1={branch.start[0]}
                y1={branch.start[1]}
                x2={branch.end[0]}
                y2={branch.end[1]}
                stroke={BARK_COLOR}
                strokeWidth={thickness}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Draw leaves with veins and animation */}
          {leaves.map((leaf, index) => {
            const windTransform = windAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, leaf.size * 0.1, 0]
            });

            return (
              <Animated.View
                key={`leaf-group-${index}`}
                style={{
                  position: 'absolute',
                  left: leaf.x - leaf.size / 2,
                  top: leaf.y - leaf.size / 2,
                  width: leaf.size,
                  height: leaf.size,
                  transform: [
                    { translateX: windTransform },
                    { rotate: `${leaf.angle}rad` }
                  ]
                }}
              >
                <Svg width={leaf.size} height={leaf.size}>
                  <Defs>
                    <RadialGradient
                      id={`leafGradient${index}`}
                      cx="50%"
                      cy="50%"
                      rx="50%"
                      ry="50%"
                      fx="50%"
                      fy="50%"
                    >
                      <Stop
                        offset="0%"
                        stopColor={LEAF_HIGHLIGHT}
                        stopOpacity="1"
                      />
                      <Stop
                        offset="70%"
                        stopColor={LEAF_COLOR}
                        stopOpacity="1"
                      />
                      <Stop
                        offset="100%"
                        stopColor={LEAF_DARK}
                        stopOpacity="1"
                      />
                    </RadialGradient>
                  </Defs>
                  {/* Main leaf shape with gradient */}
                  <Path
                    d={getLeafPath({
                      ...leaf,
                      x: leaf.size / 2,
                      y: leaf.size / 2
                    })}
                    fill={`url(#leafGradient${index})`}
                    stroke={LEAF_DARK}
                    strokeWidth={0.5}
                  />
                  {/* Veins */}
                  <Path
                    d={`
                      M ${leaf.size / 2} ${leaf.size / 2}
                      L ${leaf.size / 2} ${leaf.size * 0.1}
                      M ${leaf.size * 0.3} ${leaf.size * 0.3}
                      L ${leaf.size * 0.7} ${leaf.size * 0.3}
                      M ${leaf.size * 0.35} ${leaf.size * 0.5}
                      L ${leaf.size * 0.65} ${leaf.size * 0.5}
                      M ${leaf.size * 0.4} ${leaf.size * 0.7}
                      L ${leaf.size * 0.6} ${leaf.size * 0.7}
                    `}
                    stroke={LEAF_DARK}
                    strokeWidth={0.5}
                    opacity={0.5}
                  />
                </Svg>
              </Animated.View>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width,
  },
});

export default FractalTree;
