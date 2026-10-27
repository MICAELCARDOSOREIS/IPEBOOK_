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

const FLAT_LIST_PASSTHROUGH_KEYS = [
  "testID",
  "horizontal",
  "pagingEnabled",
  "onMomentumScrollEnd",
  "onScroll",
  "accessibilityLabel",
];

function pickPassthroughProps(props) {
  const picked = {};
  for (const key of FLAT_LIST_PASSTHROUGH_KEYS) {
    if (props[key] !== undefined) picked[key] = props[key];
  }
  return picked;
}

/** Aceita tanto elemento quanto componente, como a FlatList real. */
function renderListSlot(slot) {
  if (!slot) return null;
  return typeof slot === "function" ? React.createElement(slot) : slot;
}

const FlatList = React.forwardRef((props, ref) => {
  const data = props.data || [];
  const passthrough = pickPassthroughProps(props);
  const header = renderListSlot(props.ListHeaderComponent);
  const footer = renderListSlot(props.ListFooterComponent);
  const body = data.length === 0
    ? renderListSlot(props.ListEmptyComponent)
    : data.map((item, index) => {
      const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
      return React.createElement(React.Fragment, { key }, props.renderItem({ item, index }));
    });
  return React.createElement(View, { ref, ...passthrough }, header, body, footer);
});
FlatList.displayName = "FlatList";

const SectionList = React.forwardRef((props, ref) => {
  const sections = props.sections || [];
  const hasItems = sections.some((section) => (section.data || []).length > 0);
  if (!hasItems && props.ListEmptyComponent) {
    const empty = typeof props.ListEmptyComponent === "function"
      ? React.createElement(props.ListEmptyComponent)
      : props.ListEmptyComponent;
    return React.createElement(View, { ref }, empty);
  }
  return React.createElement(
    View,
    { ref, testID: props.testID, onRefresh: props.onRefresh, refreshing: props.refreshing },
    sections.map((section, sectionIndex) =>
      React.createElement(
        React.Fragment,
        { key: section.title || sectionIndex },
        props.renderSectionHeader ? props.renderSectionHeader({ section }) : null,
        (section.data || []).map((item, index) => {
          const key = props.keyExtractor ? props.keyExtractor(item, index) : index;
          return React.createElement(React.Fragment, { key }, props.renderItem({ item, index, section }));
        })
      )
    )
  );
});
SectionList.displayName = "SectionList";

const Image = React.forwardRef((props, ref) =>
  React.createElement("Image", { ...props, ref })
);
Image.displayName = "Image";

const ScrollView = React.forwardRef((props, ref) =>
  React.createElement("ScrollView", { ...props, ref }, props.children)
);
ScrollView.displayName = "ScrollView";

const Modal = React.forwardRef((props, ref) => {
  if (props.visible === false) return null;
  return React.createElement("Modal", { ...props, ref }, props.children);
});
Modal.displayName = "Modal";

const KeyboardAvoidingView = React.forwardRef((props, ref) =>
  React.createElement("KeyboardAvoidingView", { ...props, ref }, props.children)
);
KeyboardAvoidingView.displayName = "KeyboardAvoidingView";

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
  announceForAccessibility: () => {},
};

const Platform = {
  OS: "ios",
  select: (obj) => obj.ios || obj.default,
};

/** Emula o teclado nativo: registra listeners e permite disparar eventos nos testes. */
const keyboardListeners = new Map();
const Keyboard = {
  addListener: (type, handler) => {
    const set = keyboardListeners.get(type) || new Set();
    set.add(handler);
    keyboardListeners.set(type, set);
    return { remove: () => set.delete(handler) };
  },
  dismiss: () => {},
};
function __emitKeyboardEvent(type, height, screenY = 0) {
  const event = height === undefined ? undefined : { endCoordinates: { height, screenY } };
  for (const handler of keyboardListeners.get(type) || []) handler(event);
}
const useWindowDimensions = () => ({ width: 360, height: 800, scale: 1, fontScale: 1 });

let mockColorScheme = "light";
const useColorScheme = () => mockColorScheme;
function __setMockColorScheme(scheme) {
  mockColorScheme = scheme;
}

class MockAnimatedValue {
  constructor(v) {
    this.value = v;
  }
  setValue(v) {
    this.value = v;
  }
  __getValue() {
    return this.value;
  }
  interpolate() {
    return this;
  }
}

const Animated = {
  Value: MockAnimatedValue,
  // Em teste, o timing aplica o alvo de imediato: a animação é síncrona e previsível.
  timing: (value, config) => ({
    start: (cb) => {
      if (value && value.setValue) value.setValue(config && config.toValue != null ? config.toValue : 0);
      if (cb) cb({ finished: true });
    },
    stop: () => {},
    stopAnimation: () => {},
  }),
  loop: (_anim) => ({
    start: (cb) => {
      if (cb) cb({ finished: true });
    },
    stop: () => {},
  }),
  sequence: (_anims) => ({
    start: (cb) => {
      if (cb) cb({ finished: true });
    },
    stop: () => {},
  }),
  View: React.forwardRef((props, ref) =>
    React.createElement("View", { ...props, ref }, props.children)
  ),
};

module.exports = {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
  TextInput,
  FlatList,
  SectionList,
  StyleSheet,
  AccessibilityInfo,
  Platform,
  Keyboard,
  __emitKeyboardEvent,
  useWindowDimensions,
  Animated,
  useColorScheme,
  __setMockColorScheme,
  default: {
    View,
    Text,
    Image,
    ScrollView,
    Modal,
  KeyboardAvoidingView,
    Pressable,
    ActivityIndicator,
    TextInput,
    FlatList,
    SectionList,
    StyleSheet,
    AccessibilityInfo,
    Platform,
    Animated,
  },
};
