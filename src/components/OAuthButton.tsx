import { useClerk, useOAuth } from "@clerk/clerk-expo";
import type { EnvironmentResource, OAuthStrategy } from '@clerk/types';
import React, { useMemo } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Safely import expo modules
let WebBrowser: any = { maybeCompleteAuthSession: () => {}, warmUpAsync: () => {}, coolDownAsync: () => {} };
let Linking: any = { createURL: () => "" };

try {
  WebBrowser = require("expo-web-browser");
} catch (error) {
  console.warn('expo-web-browser import failed:', error);
}

try {
  Linking = require("expo-linking");
} catch (error) {
  console.warn('expo-linking import failed:', error);
}

// Safely initialize WebBrowser
let webBrowserAvailable = false;
try {
  // Only try to initialize WebBrowser if we're in a React Native environment
  if (Platform.OS !== 'web') {
    WebBrowser.maybeCompleteAuthSession();
    webBrowserAvailable = true;
  }
} catch (error) {
  console.warn('WebBrowser initialization failed:', error);
  webBrowserAvailable = false;
}

interface Props {
  strategy: OAuthStrategy
  children?: React.ReactNode
  hideText?: boolean
  scheme: string
}

export function OAuthButton({ strategy, children, hideText, scheme }: Props) {
  const clerk = useClerk();
  // @ts-ignore
  const environment = clerk.__unstable__environment as EnvironmentResource;
  
  React.useEffect(() => {
    if (Platform.OS !== "android" || !webBrowserAvailable) return;

    try {
      void WebBrowser.warmUpAsync();
      return () => {
        if (Platform.OS !== "android" || !webBrowserAvailable) return;
        try {
          void WebBrowser.coolDownAsync();
        } catch (error) {
          console.warn('WebBrowser cooldown failed:', error);
        }
      };
    } catch (error) {
      console.warn('WebBrowser warmup failed:', error);
      return undefined;
    }
  }, []);

  const { startOAuthFlow } = useOAuth({ strategy });

  const onPress = React.useCallback(async () => {
    if (!webBrowserAvailable && Platform.OS !== 'web') {
      console.error('WebBrowser is not available on this platform');
      return;
    }
    
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("", { scheme: scheme }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", JSON.stringify(err));
    }
  }, [startOAuthFlow, scheme]);

  // Get provider information from environment
  const providerInfo = useMemo(() => {
    if (!environment?.userSettings?.social) {
      return { name: "Sign In", logoUrl: null };
    }
    
    const provider = environment.userSettings.social[strategy as keyof typeof environment.userSettings.social];
    
    if (!provider) {
      return { name: "Sign In", logoUrl: null };
    }
    
    return {
      name: (provider as any).name || "Sign In",
      logoUrl: (provider as any).logo_url || null
    };
  }, [environment, strategy]);
  
  const buttonText = () => {
    return providerInfo.name;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      { children ? children :       
        <View style={styles.socialButton}>
          <View style={styles.socialButtonContent}>
            {providerInfo.logoUrl && (
              <Image 
                source={{ uri: providerInfo.logoUrl }} 
                style={styles.providerLogo} 
                resizeMode="contain"
              />
            )}
            {!hideText && <Text style={styles.buttonText}>{buttonText()}</Text>}
          </View>
        </View> }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  socialButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    height: 40,
    borderWidth: 1,
    borderColor: '#e6e8eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8
  },
  providerLogo: {
    width: 18,
    height: 18,
  },
  buttonText: {
    color: '#24292f',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OAuthButton;
