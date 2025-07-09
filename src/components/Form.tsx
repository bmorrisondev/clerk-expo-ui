import { Text, View, StyleSheet } from "react-native"

interface FormProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerChildren?: React.ReactNode
}

export function Form({ title, subtitle, children, headerChildren }: FormProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          {headerChildren}
        </View>
        <View style={styles.formContainer}>
          {children}
        </View>
      </View>
    </View>
  )
}

export default Form

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  contentWrapper: {
    width: "100%",
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#424242",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 8,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
});