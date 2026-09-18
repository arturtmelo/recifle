export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Poppins_600SemiBold",
  extraBold: "Poppins_700Bold",
};

export const typography = {
  h1: { fontFamily: fonts.extraBold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  button: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
} as const;
