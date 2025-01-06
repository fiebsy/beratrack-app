# Discord Roles Layout Documentation

## Overview

This document describes the layout and display of Discord role information in the UI, focusing on the glossary table and role details.

## Table Layout

### Core Columns

1. **Role Name**
   - Primary identifier with role name
   - Includes role description in tooltip with Info icon
   - Interactive tooltip for detailed information

2. **Type**
   - Role attainability type
   - Color-coded badges based on type
   - Compact display with consistent styling

3. **Rarity Distribution**
   - Text-based rarity indicator
   - Shows active user count in parentheses
   - Categories:
     - 404: No active users (Rose color)
     - UNICORN: Single active user (Amber color)
     - NGMI: 2-10 active users (Purple color)
     - ULTRA RARE: ≤5% of active users (Pink color)
     - RARE: 5-10% of active users (Indigo color)
     - UNCOMMON: 10-30% of active users (Blue color)
     - COMMON: >30% of active users (Slate color)

4. **Quality Score**
   - Power meter visualization (0-5 levels)
   - Based on weighted engagement scores
   - Categories:
     - Level 5: 40+ score - Top-tier community
     - Level 4: 30-40 score - High-tier community
     - Level 3: 20-30 score - Active community
     - Level 2: 10-20 score - Growing community
     - Level 1: 0-10 score - Emerging community
   - Special handling for Team/Bot roles

### Table Features

1. **Search/Filter**
   - Real-time role name filtering
   - Clean input interface
   - Instant results update

2. **Sorting**
   - Default sort by distribution (desc)
   - Interactive column headers
   - Visual sorting indicators

### Visual Components

1. **Power Meter**
   - 5-segment visual indicator
   - Geometric clip-path styling
   - Smooth transitions
   - Muted styling for inactive segments

2. **Rarity Labels**
   - Monospace font styling
   - Color-coded by rarity tier
   - Active user count display
   - Compact layout

### Special Cases

1. **Team/Bot Roles**
   - Custom quality tier handling
   - Special tooltip messages
   - Excluded from standard scoring

## Best Practices

1. **Visual Hierarchy**
   - Consistent spacing and alignment
   - Clear visual indicators
   - Proper use of color for status

2. **Interaction Design**
   - Responsive tooltips
   - Smooth sorting transitions
   - Clear filtering feedback

3. **Performance**
   - Client-side filtering and sorting
   - Efficient table rendering
   - Optimized component updates

## Mobile Responsiveness

1. **Table Adaptation**
   - Horizontal scrolling for narrow screens
   - Maintained column hierarchy
   - Preserved functionality

2. **Interactive Elements**
   - Touch-friendly sorting controls
   - Accessible filter input
   - Readable on small screens
