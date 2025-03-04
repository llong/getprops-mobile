import { AuthScreen } from "@screens/Auth/AuthScreen";
import { SignUpScreen } from "@screens/Auth/SignUpScreen";
import { useAuth } from "@hooks/useAuth";
import { SpotsScreen } from "@screens/Spots/SpotsScreen";
import { SpotDetailsScreen } from "@screens/Spots/SpotDetailsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AnimatedSwitcher } from "@components/AnimatedSwitcher";

// Auth stack type
type AuthStackParamList = {
  Auth: undefined;
  SignUp: undefined;
};

// Main stack type
type MainStackParamList = {
  Spots: undefined;
  SpotDetails: { spotId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Spots" component={SpotsScreen} />
      <MainStack.Screen name="SpotDetails" component={SpotDetailsScreen} />
    </MainStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <AnimatedSwitcher>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </AnimatedSwitcher>
  );
};
