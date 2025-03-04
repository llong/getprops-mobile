import { useState, useCallback } from "react";
import { SpotType, DifficultyLevel } from "@/types/database";
import { LocationParams } from "../types";

interface FormData {
  name: string;
  description: string | null;
  spotType: SpotType[];
  difficulty: DifficultyLevel;
  isLit: boolean;
  kickoutRisk: number;
  latitude: number;
  longitude: number;
  streetNumber: string | null | undefined;
  street: string | null | undefined;
  city: string | null | undefined;
  region: string | null | undefined;
  country: string | null | undefined;
  postalCode: string | null | undefined;
}

export const useSpotForm = (location: LocationParams) => {
  // Initialize form with location data
  const [formData, setFormData] = useState<FormData>(() => {
    // Create default spot name from location
    const streetName = location?.street ?? "";
    const streetNum = location?.streetNumber ? `${location.streetNumber} ` : "";
    const defaultName = `${streetNum}${streetName}`.trim();

    return {
      name: defaultName,
      description: null,
      spotType: [],
      difficulty: "beginner" as DifficultyLevel,
      isLit: false,
      kickoutRisk: 1,
      latitude: location.latitude,
      longitude: location.longitude,
      streetNumber: location.streetNumber,
      street: location.street,
      city: location.city,
      region: location.region,
      country: location.country,
      postalCode: location.postalCode,
    };
  });

  const handleNameChange = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  }, []);

  const handleSpotTypeToggle = useCallback((type: SpotType) => {
    setFormData((prev) => {
      const types = prev.spotType.includes(type)
        ? prev.spotType.filter((t) => t !== type)
        : [...prev.spotType, type];
      return { ...prev, spotType: types };
    });
  }, []);

  // Reset the form to its initial state
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: null,
      spotType: [],
      difficulty: "beginner" as DifficultyLevel,
      isLit: false,
      kickoutRisk: 1,
      latitude: location.latitude,
      longitude: location.longitude,
      streetNumber: location.streetNumber,
      street: location.street,
      city: location.city,
      region: location.region,
      country: location.country,
      postalCode: location.postalCode,
    });
  }, [location]);

  const isFormValid = useCallback(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.spotType.length > 0 &&
      formData.difficulty !== null &&
      formData.kickoutRisk >= 0 &&
      formData.kickoutRisk <= 5 &&
      typeof formData.isLit === "boolean" &&
      formData.latitude !== null &&
      formData.longitude !== null
    );
  }, [formData]);

  return {
    formData,
    setFormData,
    handleNameChange,
    handleSpotTypeToggle,
    isFormValid,
    resetForm,
  };
};
