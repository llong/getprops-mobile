import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ButtonGroup, useTheme } from "@rneui/themed";
import { DifficultyLevel } from "@/types/database";

interface DifficultySectionProps {
  selectedDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
}

export const DifficultySection: React.FC<DifficultySectionProps> = ({
  selectedDifficulty,
  onDifficultyChange,
}) => {
  const { theme } = useTheme();

  const difficultyOptions = [
    { label: "Beginner", value: DifficultyLevel.Beginner },
    { label: "Intermediate", value: DifficultyLevel.Intermediate },
    { label: "Advanced", value: DifficultyLevel.Advanced },
  ];

  const selectedIndex = difficultyOptions.findIndex(
    (option) => option.value === selectedDifficulty
  );

  const handleDifficultyChange = (index: number) => {
    onDifficultyChange(difficultyOptions[index].value);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Difficulty Level</Text>
      <ButtonGroup
        buttons={difficultyOptions.map((option) => option.label)}
        selectedIndex={selectedIndex}
        onPress={handleDifficultyChange}
        containerStyle={styles.buttonGroup}
        selectedButtonStyle={{ backgroundColor: theme.colors.primary }}
        textStyle={{ fontSize: 14 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  buttonGroup: {
    marginHorizontal: 0,
    borderRadius: 8,
  },
});
