// Add functions to handle preferred locations
// ... existing code ...

// Function to add a custom preferred location
const handleAddCustomLocation = () => {
  if (!newLocation.trim()) return;
  
  // Check if location already exists to avoid duplicates
  if (formData.preferredLocations.includes(newLocation.trim())) {
    toast.info("This location is already in your preferences");
    setNewLocation("");
    return;
  }
  
  const updatedLocations = [...formData.preferredLocations, newLocation.trim()];
  setFormData({
    ...formData,
    preferredLocations: updatedLocations
  });
  setNewLocation("");
};

// ... existing code ... 