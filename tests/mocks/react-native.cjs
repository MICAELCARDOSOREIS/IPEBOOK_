const React = require("react");

const View = React.forwardRef((props, ref) =>
  React.createElement("View", { ...props, ref }, props.children)
);
View.displayName = "View";

const Text = React.forwardRef((props, ref) =>
  React.createElement("Text", { ...props, ref }, props.children)
);
Text.displayName = "Text";

const Pressable = React.forwardRef((props, ref) =>
  React.createElement(
    "Pressable",
    {
      ...props,
      accessible: props.accessible !== undefined ? props.accessible : true,
      accessibilityRole: props.accessibilityRole || "button",
      ref,
    },
    typeof props.children === "function" ? props.children({ pressed: false }) : props.children
  )
);
Pressable.displayName = "Pressable";

const ActivityIndicator = React.forwardRef((props, ref) =>
  React.createElement("ActivityIndicator", { ...props, ref })
);
ActivityIndicator.displayName = "ActivityIndicator";

const TextInput = React.forwardRef((props, ref) =>
  React.createElement("TextInput", { ...props, ref })
);
TextInput.displayName = "TextInput";

const FlatList = React.forwardRef((props, ref) => {
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
    data.map((item, index) => {
      const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
      return React.createElement(React.Fragment, { key }, props.renderItem({ item, index }));
    })
  );
});
FlatList.displayName = "FlatList";

const Image = React.forwardRef((props, ref) =>
  React.createElement("Image", { ...props, ref })
);
Image.displayName = "Image";

const Modal = React.forwardRef((props, ref) => {
  if (props.visible === false) return null;
  return React.createElement("Modal", { ...props, ref }, props.children);
});
Modal.displayName = "Modal";

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
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

const AccessibilityInfo = {
  isScreenReaderEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
};

const Platform = {
  OS: "ios",
  select: (obj) => obj.ios || obj.default,
};

module.exports = {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  FlatList,
  StyleSheet,
  AccessibilityInfo,
  Platform,
  default: {
    View,
    Text,
    Image,
    Modal,
    Pressable,
    ActivityIndicator,
    TextInput,
    FlatList,
    StyleSheet,
    AccessibilityInfo,
    Platform,
  },
};
