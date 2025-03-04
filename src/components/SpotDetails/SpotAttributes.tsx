import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon, useTheme } from "@rneui/themed";
import { SpotType } from "@/types/database";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#4CAF50", // Green
  intermediate: "#FF9800", // Orange
  advanced: "#F44336", // Red
};

interface SpotAttributesProps {
  spotType?: SpotType[];
  difficulty?: string;
  kickoutRisk?: number;
  isLit?: boolean;
  description?: string;
}

export const SpotAttributes = memo(
  ({
    spotType = [],
    difficulty = "beginner",
    kickoutRisk = 0,
    isLit = false,
    description,
  }: SpotAttributesProps) => {
    const { theme } = useTheme();

    const renderKickoutRiskIndicator = (risk: number) => {
      const maxRisks = 5;
      const filledRisks = risk || 0;

      return (
        <View style={styles.kickoutRiskContainer}>
          {[...Array(maxRisks)].map((_, index: number) => (
            <Icon
              key={index}
              name="alert-triangle"
              type="feather"
              size={16}
              color={
                index < filledRisks ? theme.colors.error : theme.colors.grey4
              }
              containerStyle={{ marginRight: 4 }}
            />
          ))}
        </View>
      );
    };

    return (
      <View style={styles.detailsContainer}>
        {/* Type Tags */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Spot Type</Text>
          <View style={styles.tagsContainer}>
            {spotType?.map((type: SpotType) => (
              <View
                key={type}
                style={[
                  styles.tag,
                  { backgroundColor: theme.colors.primary + "30" },
                ]}
              >
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spot Attributes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Spot Info</Text>

          <View style={styles.attributesContainer}>
            {/* Difficulty */}
            <View style={styles.attributeItem}>
              <View style={styles.attributeIconContainer}>
                <Icon
                  name="trending-up"
                  type="feather"
                  size={18}
                  color={DIFFICULTY_COLORS[difficulty || "beginner"]}
                />
              </View>
              <View>
                <Text style={styles.attributeLabel}>Difficulty</Text>
                <Text style={styles.attributeValue}>
                  {difficulty
                    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                    : "Beginner"}
                </Text>
              </View>
            </View>

            {/* Kickout Risk */}
            <View style={styles.attributeItem}>
              <View style={styles.attributeIconContainer}>
                <Icon
                  name="shield-alert"
                  type="material-community"
                  size={18}
                  color={theme.colors.error}
                />
              </View>
              <View>
                <Text style={styles.attributeLabel}>Kickout Risk</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {renderKickoutRiskIndicator(kickoutRisk || 0)}
                </View>
              </View>
            </View>

            {/* Lighting */}
            <View style={styles.attributeItem}>
              <View style={styles.attributeIconContainer}>
                <Icon
                  name={isLit ? "lightbulb" : "lightbulb-outline"}
                  type="material-community"
                  size={18}
                  color={isLit ? "#FFD700" : theme.colors.grey3}
                />
              </View>
              <View>
                <Text style={styles.attributeLabel}>Lighting</Text>
                <Text style={styles.attributeValue}>
                  {isLit ? "Lit at night" : "Not lit"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {description && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  detailsContainer: {
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  attributesContainer: {
    marginTop: 5,
  },
  attributeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  attributeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  attributeLabel: {
    fontSize: 14,
    color: "#666",
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  kickoutRiskContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
