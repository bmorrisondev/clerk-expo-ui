import { StyleSheet, Text, View } from 'react-native'

interface Props {
    title?: string
}

function FormDivider({ title = "or" }: Props) {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  )
}

export default FormDivider

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 4
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    textAlign: "center",
    color: "#757575",
  },
});