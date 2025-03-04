import { LinkingOptions } from "@react-navigation/native";
import { RootTabParamList } from "@/types/navigation";

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ["getprops://"],
  config: {
    screens: {
      SpotStack: {
        screens: {
          SpotsList: "spots",
          SpotDetails: "spot/:id",
        },
      },
      ProfileStack: {
        screens: {
          ProfileMain: "profile",
          EditProfile: "profile/edit",
        },
      },
    },
  },
};
