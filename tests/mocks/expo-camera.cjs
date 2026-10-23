const React = require("react");

function CameraView(props) {
  return React.createElement("CameraView", props, props.children);
}

const useCameraPermissions = () => [
  { granted: true, canAskAgain: true, status: "granted" },
  () => Promise.resolve({ granted: true, status: "granted" }),
];

module.exports = {
  CameraView,
  useCameraPermissions,
};
