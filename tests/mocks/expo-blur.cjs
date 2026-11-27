const React = require("react");
const { View } = require("react-native");

const BlurView = (props) =>
  React.createElement(View, { ...props, testID: props.testID || "blur-view" });

module.exports = { BlurView };
