# Location-Based Features Implementation

## Overview
We have implemented location-based features to help teen users find jobs near them. This includes automatic location detection, distance calculation, and sorting jobs by proximity.

## Features Added

### 1. Automatic Location Detection
- **Where**: Edit Profile Page (`EditProfilePage.tsx`)
- **Functionality**: Added a "Use Current Location" button (Map Pin icon) next to the location input.
- **How it works**:
    - Uses the browser's `navigator.geolocation` API to get GPS coordinates (latitude/longitude).
    - Uses OpenStreetMap's Nominatim API to reverse geocode coordinates into a city name.
    - Automatically fills the location text field and saves the coordinates to the user's profile.

### 2. Distance Calculation
- **Where**: `TeenDashboard.tsx` and `JobsPage.tsx`
- **Method**: Implemented the Haversine formula to calculate the distance between two points on Earth (user's location and job location) in kilometers.

### 3. Dynamic "Jobs Near You" Section
- **Where**: Teen Dashboard (`TeenDashboard.tsx`)
- **Functionality**:
    - The "Jobs Near You" section is no longer static.
    - It dynamically calculates the distance from the user to all available jobs.
    - Filters jobs to show only those within 50km.
    - Sorts jobs by distance (closest first).
    - Displays the distance (e.g., "📍 2.5 km") on the job card.

### 4. Jobs Search & Sorting
- **Where**: Jobs Search Page (`JobsPage.tsx`)
- **Functionality**:
    - Added a "Sort by Distance" button.
    - When enabled, jobs are sorted by their distance from the user.
    - Displays the distance on each job card in the search results.

## Technical Details

### Modified Files
- `types.ts`: Added optional `distance` field to `Job` interface.
- `EditProfilePage.tsx`: Added geolocation logic and button.
- `TeenDashboard.tsx`: Added `calculateDistance` helper, `useMemo` for dynamic job filtering, and updated `JobCard`.
- `JobsPage.tsx`: Added `userLocation` prop, distance calculation, and sorting logic.
