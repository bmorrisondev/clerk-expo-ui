import React from 'react'
import { Button } from './Button'
import { StyleProp, Text, TouchableOpacityProps, ViewStyle, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props extends TouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
}

function ContinueButton({ style, ...props }: Props) {
  return (
    <Button {...props} >
      <LinearGradient
        colors={['#6d53f8', '#5c40f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.continueButton}
      >
        <Text style={styles.text}>Continue</Text>
        <Ionicons name="caret-forward-outline" size={18} style={styles.icon} />
      </LinearGradient>
    </Button>
  )
}

const styles = StyleSheet.create({
  text: {
    color: '#fbfaff'
  },
  icon: {
    color: '#c5bbfc'
  },
  continueButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
});

export default ContinueButton