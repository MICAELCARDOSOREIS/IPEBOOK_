import React from "react";
import { View } from "react-native";

export const BlurView = (props: any) =>
  React.createElement(View, { ...props, testID: props.testID || "blur-view" });
