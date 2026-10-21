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

const FLAT_LIST_PASSTHROUGH_KEYS = [
  "testID",
  "horizontal",
  "pagingEnabled",
  "onMomentumScrollEnd",
  "onScroll",
  "accessibilityLabel",
];

function pickPassthroughProps(props: any): Record<string, any> {
  const picked: Record<string, any> = {};
  for (const key of FLAT_LIST_PASSTHROUGH_KEYS) {
    if (props[key] !== undefined) picked[key] = props[key];
  }
  return picked;
}

export const FlatList = React.forwardRef<any, any>((props, ref) => {
  const data = props.data || [];
  const passthrough = pickPassthroughProps(props);
  if (data.length === 0 && props.ListEmptyComponent) {
    const empty = typeof props.ListEmptyComponent === "function"
      ? React.createElement(props.ListEmptyComponent)
      : props.ListEmptyComponent;
    return React.createElement(View, { ref, ...passthrough }, empty);
  }
  return React.createElement(
    View,
    { ref, ...passthrough },
    data.map((item: any, index: number) => {
      const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
      return React.createElement(React.Fragment, { key }, props.renderItem({ item, index }));
    })
  );
});
FlatList.displayName = "FlatList";

export const SectionList = React.forwardRef<any, any>((props: any, ref: any) => {
  const sections = props.sections || [];
  const hasItems = sections.some((section: any) => (section.data || []).length > 0);
  if (!hasItems && props.ListEmptyComponent) {
    const empty = typeof props.ListEmptyComponent === "function"
      ? React.createElement(props.ListEmptyComponent)
      : props.ListEmptyComponent;
    return React.createElement(View, { ref }, empty);
  }
  return React.createElement(
    View,
    { ref },
    sections.map((section: any, sectionIndex: number) =>
      React.createElement(
        React.Fragment,
        { key: section.title || sectionIndex },
        props.renderSectionHeader ? props.renderSectionHeader({ section }) : null,
        (section.data || []).map((item: any, index: number) => {
          const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
          return React.createElement(React.Fragment, { key }, props.renderItem({ item, index, section }));
        })
      )
    )
  );
});
SectionList.displayName = "SectionList";

export const Image = React.forwardRef<any, any>((props, ref) =>
  React.createElement("Image", { ...props, ref })
);
Image.displayName = "Image";

export const ScrollView = React.forwardRef<any, any>((props, ref) =>
  React.createElement("ScrollView", { ...props, ref }, props.children)
);
ScrollView.displayName = "ScrollView";

export const Modal = React.forwardRef<any, any>((props, ref) => {
  if (props.visible === false) return null;
  return React.createElement("Modal", { ...props, ref }, props.children);
});
Modal.displayName = "Modal";

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any): any => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.map(StyleSheet.flatten));
    }
    return style;
  },
  absoluteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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

export const Share = {
  share: (_content: { message?: string; url?: string; title?: string }) =>
    Promise.resolve({ action: "sharedAction" }),
};

export default {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  FlatList,
  SectionList,
  StyleSheet,
  AccessibilityInfo,
  Platform,
  Share,
};
