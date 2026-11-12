const React = require("react");

function MaterialIcons(props) {
  return React.createElement("MaterialIcons", props, props.children);
}

function Ionicons(props) {
  return React.createElement("Ionicons", props, props.children);
}

module.exports = {
  MaterialIcons,
  Ionicons,
};
