declare module "expo-image-crop" {
  import { ViewProps } from "react-native";

  interface ImageManipulatorProps extends ViewProps {
    photo: { uri: string };
    isVisible: boolean;
    onPictureChoosed: (result: { uri: string }) => void;
    onToggleModal: () => void;
    allowRotate?: boolean;
    allowFlip?: boolean;
    fixedMask?: { width: number; height: number };
    maskType?: "circle" | "rect";
    resizeMode?: "contain" | "cover" | "stretch";
    backgroundColor?: string;
    style?: any;
  }

  export class ImageManipulator extends React.Component<ImageManipulatorProps> {}
}
