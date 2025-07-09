import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

function TextButton({ onPress, text }: { onPress: () => void, text: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.switchModeButton} >
      <Text style={styles.switchModeText}>{text}</Text>
    </TouchableOpacity>
  )
}

export default TextButton

const styles = StyleSheet.create({
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 8,
  },
  switchModeText: {
    fontSize: 16,
    color: "#5e41f7",
    fontWeight: "500",
  }
});