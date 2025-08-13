declare module '@env' {
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const REVERSED_GOOGLE_IOS_CLIENT_ID: string;
}

// Ambient module declarations for vector icons to satisfy TypeScript
declare module 'react-native-vector-icons/Ionicons' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const Ionicons: ComponentType<VectorIconProps>;
  export default Ionicons;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const MaterialIcons: ComponentType<VectorIconProps>;
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const MaterialCommunityIcons: ComponentType<VectorIconProps>;
  export default MaterialCommunityIcons;
}

declare module 'react-native-vector-icons/Feather' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const Feather: ComponentType<VectorIconProps>;
  export default Feather;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const FontAwesome: ComponentType<VectorIconProps>;
  export default FontAwesome;
}

declare module 'react-native-vector-icons/AntDesign' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';
  interface VectorIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  const AntDesign: ComponentType<VectorIconProps>;
  export default AntDesign;
}

// Ambient module declaration for slider (to satisfy TS until @types are resolved)
declare module '@react-native-community/slider' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';
  interface SliderProps extends ViewProps {
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    value?: number;
    onValueChange?: (value: number) => void;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
  }
  const Slider: ComponentType<SliderProps>;
  export default Slider;
}

// Ambient module declaration for rich editor (no official @types)
declare module 'react-native-pell-rich-editor' {
  import type { ComponentType } from 'react';
  import type { ViewStyle, StyleProp } from 'react-native';

  export interface RichEditorProps {
    initialContentHTML?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
    editorStyle?: any;
    style?: StyleProp<ViewStyle>;
    useContainer?: boolean;
    androidHardwareAccelerationDisabled?: boolean;
  }

  export const actions: Record<string, string> & {
    insertLink: string;
    insertBulletsList: string;
    insertOrderedList: string;
    bold: string;
    italic: string;
    underline: string;
    undo: string;
    redo: string;
  };

  export class RichEditor extends React.Component<RichEditorProps> {}

  export interface RichToolbarProps {
    editor?: any;
    actions?: string[];
    iconMap?: Record<string, any>;
    style?: StyleProp<ViewStyle>;
  }

  export const RichToolbar: ComponentType<RichToolbarProps>;
}
