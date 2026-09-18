export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Map: undefined;
  CreateListing: undefined;
  Negotiations: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ListingDetail: { id: string };
  NegotiationDetail: { id: string };
  DealDetail: { id: string };
  Notifications: undefined;
  CenterProfile: { id: string };
  EditCenterProfile: undefined;
  Search: undefined;
  Favorites: undefined;
};
