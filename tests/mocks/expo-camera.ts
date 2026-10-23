import React from "react";

export function CameraView(props: any) {
  return React.createElement("CameraView", props, props.children);
}

export const useCameraPermissions = () => [
  { granted: true, canAskAgain: true, status: "granted" },
  () => Promise.resolve({ granted: true, status: "granted" }),
];
