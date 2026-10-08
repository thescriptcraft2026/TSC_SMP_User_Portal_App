import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './navigationRef';
import { openPendingContest } from './src/referral/referralService';
import BottomTabs from './src/navigation/BottomTab';
import SplashScreen from './src/screens/SplashScreen';
import Login from './src/screens/Auth/Login';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import ResetPassword from './src/screens/Auth/ResetPassword';
import SignUp from './src/screens/Auth/SignUp';
import ChooseInterests from './src/screens/Auth/ChooseInterests';
import SearchScreen from './src/screens/Search/SearchScreen';
import ChatListScreen from './src/screens/Chat/ChatListScreen';
import ChatRoomScreen from './src/screens/Chat/ChatRoomScreen';
import OtpVerification from './src/screens/Auth/OtpVerification';
import OnBoarding from './src/screens/OnBoarding/OnBoarding';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import DrawerLayout from './src/components/Drawer/DrawerLayout';
import AllBooks from './src/screens/Books/AllBooks';
import SinglePostScreen from './src/components/Post/SinglePostScreen';
import NotificationScreen from './src/screens/Notification/Notification';
import AddBook from './src/screens/Books/AddBook';
import AddSynopsis from './src/screens/Synopsis/AddSynopsis';
import AddContest from './src/screens/Contest/AddContest';
import AddOpportunity from './src/screens/Opportunity/AddOpportunity';
import AddVisionX from './src/screens/VisionX/AddVisionX';
import BookDetails from './src/screens/Books/BookDetails';
import AllSynopsis from './src/screens/Synopsis/AllSynopsis';
import AllVisionX from './src/screens/VisionX/AllVisionX';
import SynopsisDetails from './src/screens/Synopsis/SynopsisDetails';
import SingleVisionXDetails from './src/screens/VisionX/SingleVisionXDetails';
import AddPost from './src/components/Post/AddPost';
import ContestDetails from './src/screens/Contest/ContestDetails';
import ParticipateNow from './src/screens/Contest/ParticipateNow';
import ReviewSubmission from './src/screens/Contest/ReviewSubmission';
import SuccessScreen from './src/screens/Contest/SuccessScreen';
import BookMarks from './src/screens/BookMark/BookMarks';
import Movie from './src/screens/Movie/Movie';
import SingleMovieDetails from './src/screens/Movie/SingleMovieDetails';
import SingleOpportunityDetails from './src/screens/Opportunity/SingleOpportunityDetails';
import ApplyOpportunity from './src/screens/Opportunity/ApplyOpportunity';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import ProfileSetting from './src/screens/Profile/ProfileSetting';
import PrivacySettings from './src/screens/Profile/PrivacySettings';
import ParticipateDetails from './src/screens/Contest/ParticipateDetails';
import ViewAllSubmissions from './src/screens/Contest/ViewAllSubmissions';
import MyConnections from './src/screens/Profile/MyConnections';
import RoleEditScreen from './src/screens/Profile/components/RoleEditScreen';
import AddExpreince from './src/screens/Profile/components/AddExpreince';
import EditBook from './src/screens/Books/EditBook';
import ViewMyOpportunitySubmisiions from './src/screens/Opportunity/ViewMyOpportunitySubmisiions';
import StaticScreen from './src/screens/NonLogin/StaticScreen';
import Opportunity from './src/screens/Opportunity/Opportunity';
import AllContest from './src/screens/Contest/AllContest';
import OnlinePrefrence from './src/screens/Profile/OnlinePrefrence';
import AddUserName from './src/screens/Auth/AddUserName';
import Tutorial from './src/screens/Tutorial/Tutorial';
import ImageViewerScreen from './src/components/Post/ImageViewerScreen';
import CollaborateForm from './src/screens/NonLogin/components/CollaborateForm';
import BioSetupScreen from './src/screens/Auth/BioSetupScreen';
import RoleSetupScreen from './src/screens/Auth/RoleSetupScreen';
import RepostDetails from './src/components/Post/RepostDetails';
import NotFoundScreen from './src/screens/NotFoundScreen';

const Stack = createNativeStackNavigator();

// ✅ AUTH STACK
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={SignUp} />
      <Stack.Screen name="OTP" component={OtpVerification} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="AddUserName" component={AddUserName} />
      <Stack.Screen name="ChooseInterests" component={ChooseInterests} />
      <Stack.Screen name="BioSetup" component={BioSetupScreen} />
      <Stack.Screen name="RoleSetup" component={RoleSetupScreen} />
    </Stack.Navigator>
  );
};

// ✅ APP STACK
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="BottomTab"
    >
      <Stack.Screen name="BottomTab" component={BottomTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Chats" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ProfileSetting" component={ProfileSetting} />
      <Stack.Screen name="PrivacySetting" component={PrivacySettings} />
      <Stack.Screen name="MyConnections" component={MyConnections} />
      <Stack.Screen name="RoleEdit" component={RoleEditScreen} />
      <Stack.Screen name="AddExperience" component={AddExpreince} />
      <Stack.Screen name="OnlinePrefrence" component={OnlinePrefrence} />

      <Stack.Screen name="AddPost" component={AddPost} />

      <Stack.Screen name="AllOpportunity" component={Opportunity} />
      <Stack.Screen name="AllContest" component={AllContest} />

      <Stack.Screen name="AllBooks" component={AllBooks} />
      <Stack.Screen name="AddBook" component={AddBook} />
      <Stack.Screen name="EditBook" component={EditBook} />
      <Stack.Screen name="BookDetails" component={BookDetails} />

      <Stack.Screen name="SinglePostDetailes" component={SinglePostScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="RepostDetails" component={RepostDetails} />


      <Stack.Screen name="AddSynopsis" component={AddSynopsis} />
      <Stack.Screen name="AllSynopsis" component={AllSynopsis} />
      <Stack.Screen name="SynopsisDetails" component={SynopsisDetails} />

      <Stack.Screen name="AddContest" component={AddContest} />
      <Stack.Screen name="AddOpportunity" component={AddOpportunity} />
      <Stack.Screen
        name="ViewMyOpportunitySubmisiions"
        component={ViewMyOpportunitySubmisiions}
      />

      <Stack.Screen name="ContestDetails" component={ContestDetails} />
      <Stack.Screen name="ParticipateNow" component={ParticipateNow} />
      <Stack.Screen name="ParticipateDetails" component={ParticipateDetails} />
      <Stack.Screen name="ReviewSubmission" component={ReviewSubmission} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="ViewAllSubmissions" component={ViewAllSubmissions} />

      <Stack.Screen name="AllVisionX" component={AllVisionX} />
      <Stack.Screen name="AddVisionX" component={AddVisionX} />
      <Stack.Screen name="VisionXDetails" component={SingleVisionXDetails} />

      <Stack.Screen name="BookMarks" component={BookMarks} />

      <Stack.Screen name="AllMovies" component={Movie} />
      <Stack.Screen name="SingleMovieDetails" component={SingleMovieDetails} />

      <Stack.Screen
        name="SingleOpportunityDetails"
        component={SingleOpportunityDetails}
      />
      <Stack.Screen name="ApplyOpportunity" component={ApplyOpportunity} />
      <Stack.Screen name="Static" component={StaticScreen} />
      <Stack.Screen name="CollaborateForm" component={CollaborateForm} />

      <Stack.Screen name="Tutorials" component={Tutorial} />

      <Stack.Screen
        name="ImageViewer"
        component={ImageViewerScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen name='NotFound' component={NotFoundScreen}/>
    </Stack.Navigator>
  );
};

const AppWithDrawer = () => {
  return (
    <DrawerLayout enableGesture={false}>
      <AppStack />
    </DrawerLayout>
  );
};

const Navigator = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={openPendingContest}
      onStateChange={openPendingContest}
    >
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="onBoarding" component={OnBoarding} />

        {/* Auth */}
        <Stack.Screen name="Auth" component={AuthStack} />

        {/* ✅ ONLY APP HAS DRAWER */}
        <Stack.Screen name="App" component={AppWithDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
