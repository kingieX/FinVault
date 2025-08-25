import { NavigatorScreenParams } from "@react-navigation/native";

// 1. Define the types for the parameters of each screen
export type AppStackParamList = {
  Home: undefined; // Home screen has no parameters
  Goals: undefined; // Goals screen has no parameters
  GoalDetail: { goalId: string }; // GoalDetail screen expects a goalId parameter
  BudgetDetail: { budgetId: string };
  NotificationDetail: { notificationId: string };
  Login: undefined;
  // Add other screens here
};

// 2. Define the main root stack navigator parameters
export type RootStackParamList = {
  // Main app stack
  AppStack: NavigatorScreenParams<AppStackParamList>;
  // Other top-level screens like the initial login or intro screen
  Intro: undefined;
  Welcome: undefined;
};
