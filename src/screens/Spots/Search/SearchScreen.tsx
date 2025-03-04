import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Button, Chip, Text } from "@rneui/themed";
import { useSpotSearch } from "@hooks/useSpotSearch";
import { SpotFilters, SpotType, DifficultyLevel } from "@/types/database";
import { SpotListItem } from "./components/SpotListItem";

export const SearchScreen = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SpotFilters>({
    spotType: [],
    difficulty: [],
    isLit: undefined,
    maxDistance: 50,
  });

  const { results, loading } = useSpotSearch();

  const spotTypes: SpotType[] = [
    "rail",
    "ledge",
    "gap",
    "wall_ride",
    "skatepark",
    "manual_pad",
  ];

  const difficulties: DifficultyLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
  ];

  const toggleSpotType = (type: SpotType) => {
    setFilters((prev) => {
      const currentTypes = prev.spotType || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];

      return {
        ...prev,
        spotType: newTypes,
      };
    });
  };

  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty?.includes(difficulty)
        ? prev.difficulty.filter((d) => d !== difficulty)
        : [...(prev.difficulty || []), difficulty],
    }));
  };

  const toggleLighting = () => {
    setFilters((prev) => {
      let newLitValue;
      if (prev.isLit === undefined) {
        newLitValue = true;
      } else if (prev.isLit) {
        newLitValue = false;
      } else {
        newLitValue = undefined;
      }

      return {
        ...prev,
        isLit: newLitValue,
      };
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title={showFilters ? "Hide Filters" : "Show Filters"}
        type="clear"
        onPress={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <View style={styles.filters}>
          <Text style={styles.filterTitle}>Spot Types</Text>
          <View style={styles.chipGroup}>
            {spotTypes.map((type) => (
              <Chip
                key={type}
                title={type}
                type={filters.spotType?.includes(type) ? "solid" : "outline"}
                onPress={() => toggleSpotType(type)}
                containerStyle={styles.chip}
              />
            ))}
          </View>

          <Text style={styles.filterTitle}>Difficulty</Text>
          <View style={styles.chipGroup}>
            {difficulties.map((diff) => (
              <Chip
                key={diff}
                title={diff}
                type={filters.difficulty?.includes(diff) ? "solid" : "outline"}
                onPress={() => toggleDifficulty(diff)}
                containerStyle={styles.chip}
              />
            ))}
          </View>

          <Chip
            title="Lit at Night"
            type={filters.isLit ? "solid" : "outline"}
            onPress={toggleLighting}
            containerStyle={styles.chip}
          />
        </View>
      )}

      <FlatList
        data={results}
        renderItem={({ item }) => <SpotListItem spot={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Loading..." : "No spots found"}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filters: {
    padding: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  chip: {
    margin: 2,
  },
  list: {
    flexGrow: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});
