import React from 'react'
import { SignInFirstFactor } from "@clerk/types";
import Button from './Button';
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text } from 'react-native';

interface AlternateFirstFactorsProps {
  factors: SignInFirstFactor[]
  onSelectFactor: (factor: SignInFirstFactor) => void
  selectedFactor?: SignInFirstFactor
}

function AlternateFirstFactors({ factors, onSelectFactor, selectedFactor }: AlternateFirstFactorsProps) {
  const filteredFactors = factors.filter(f => f.strategy !== 'reset_password_email_code' && f.strategy !== selectedFactor?.strategy)
  
  function createStrategyButton(factor: SignInFirstFactor) {
    return (
      <Button 
        key={factor.strategy} 
        style={styles.alternateMethodButton}
        onPress={() => onSelectFactor(factor)}
      >
        {factor.strategy === 'email_code' ? (
          <>
            <Ionicons name="mail" size={24} color="#3a3b43" />
            <Text style={styles.alternateMethodText}>
              Email code to {factor.safeIdentifier}
            </Text>
        </>
      ) : (
        <Text style={styles.alternateMethodText}>
          {factor.strategy}
        </Text>
      )}
      </Button>
    )
  }
  
  return (
    <>
      {filteredFactors.map((factor) => (
        createStrategyButton(factor)
      ))}
    </>
  )
}

export default AlternateFirstFactors

const styles = StyleSheet.create({
  alternateMethodButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
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
    flexDirection: 'row',
  },
  alternateMethodText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
});