import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SpotsScreen } from "@/screens/Spots/SpotsScreen";
import { SpotDetailsScreen } from "@/screens/Spots/SpotDetailsScreen";
import { AddSpotScreen } from "@/screens/Spots/AddSpot/AddSpotScreen";
import { EditSpotScreen } from "@/screens/Spots/EditSpot/EditSpotScreen";
import { SpotMediaScreen } from "@/screens/Spots/SpotMediaScreen";
import { SpotsStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<SpotsStackParamList>();

export const SpotsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Spots"
        component={SpotsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SpotDetails"
        component={SpotDetailsScreen}
        options={{ headerTitle: "Spot Details" }}
      />
      <Stack.Screen
        name="AddSpot"
        component={AddSpotScreen}
        options={{ headerTitle: "Add New Spot" }}
      />
      <Stack.Screen
        name="EditSpot"
        component={EditSpotScreen}
        options={{ headerTitle: "Edit Spot" }}
      />
      <Stack.Screen
        name="SpotMedia"
        component={SpotMediaScreen}
        options={{ headerTitle: "Media" }}
      />
    </Stack.Navigator>
  );
};
