import React from "react";

export const View = React.forwardRef<any, any>((props, ref) =>
  React.createElement("View", { ...props, ref }, props.children)
);
View.displayName = "View";

export const Text = React.forwardRef<any, any>((props, ref) =>
  React.createElement("Text", { ...props, ref }, props.children)
);
Text.displayName = "Text";

export const Pressable = React.forwardRef<any, any>((props, ref) =>
  React.createElement(
    "Pressable",
    {
      ...props,
      accessible: props.accessible ?? true,
      ref,
      accessibilityRole: props.accessibilityRole ?? "button",
    },
    typeof props.children === "function" ? props.children({ pressed: false }) : props.children
  )
);
Pressable.displayName = "Pressable";

export const ActivityIndicator = React.forwardRef<any, any>((props, ref) =>
  React.createElement("ActivityIndicator", { ...props, ref })
);
ActivityIndicator.displayName = "ActivityIndicator";

export const TextInput = React.forwardRef<any, any>((props, ref) =>
  React.createElement("TextInput", { ...props, ref })
);
TextInput.displayName = "TextInput";

export const FlatList = React.forwardRef<any, any>((props, ref) => {
  const data = props.data || [];
  if (data.length === 0 && props.ListEmptyComponent) {
    const empty = typeof props.ListEmptyComponent === "function"
      ? React.createElement(props.ListEmptyComponent)
      : props.ListEmptyComponent;
    return React.createElement(View, { ref }, empty);
  }
  return React.createElement(
    View,
    { ref },
    data.map((item: any, index: number) => {
      const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
      return React.createElement(React.Fragment, { key }, props.renderItem({ item, index }));
    })
  );
});
FlatList.displayName = "FlatList";

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any): any => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.map(StyleSheet.flatten));
    }
    return style;
  },
};

export const AccessibilityInfo = {
  isScreenReaderEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
};

export const Platform = {
  OS: "ios",
  select: (obj: any) => obj.ios ?? obj.default,
};

export default {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  FlatList,
  StyleSheet,
  AccessibilityInfo,
  Platform,
};
