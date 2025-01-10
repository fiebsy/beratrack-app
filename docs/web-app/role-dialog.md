# Role Dialog Component Documentation

## Overview
The Role Dialog component (`role-dialog.tsx`) serves as a detailed view modal for Discord roles in the Berachain community. It provides an in-depth analysis of role metrics, engagement, and status.

## Component Architecture

### Main Files
- `src/components/glossary/table/role-dialog.tsx`: Main dialog component
- `src/components/glossary/types.ts`: Type definitions for role data
- `src/components/glossary/table/quality-tier.ts`: Quality score calculations
- `src/components/glossary/table/percentage-bar.tsx`: Distribution visualization
- `src/components/glossary/table/role-status.tsx`: Role status badges

### Data Flow
1. Receives role data from parent table component
2. Displays detailed metrics and analysis
3. Updates visibility state through `onOpenChange` callback

## Key Features

### 1. Header Section
- Role name and badge
- Role status indicator (OPEN/CLOSED/RESTRICTED)
- Badge category marker

### 2. Description Section
- Role purpose explanation
- Community context

### 3. Analysis Sections
- Distribution stats ("Thiccness Level")
  - Active user count
  - Percentage of total community
  - Recent changes tracking
- Quality metrics ("Vibe Check")
  - BASED score analysis
  - Community rank
  - Engagement indicators

### 4. Visual Elements
- Percentage bar for distribution
- Power meter for quality score
- Status badges and icons
- Dynamic tooltips

## Styling Conventions

### Color System
- Uses N930 (#191919) for section backgrounds
- N940 (#131313) for deeper layers
- Status colors:
  - OPEN: GNEON
  - CLOSED: RNEON
  - RESTRICTED: #FFA500

### Typography
- Font sizes: 8px to 24px
- Mono font for metrics
- Regular font for descriptions

## State Management
- Controlled through parent component
- Uses portal for modal rendering
- Manages keyboard (Escape) and click-outside events

## Interaction Points
1. Close button
2. Overlay click
3. Escape key press
4. Status badge hover
5. Metric tooltips

## Dependencies
- React Portal for modal rendering
- Phosphor Icons
- Tailwind CSS
- Custom utility components

## Future Considerations

### Extensibility Points
1. Additional metric sections
2. New status types
3. Enhanced visualizations
4. Role comparison features

### Performance Optimizations
- Component memoization opportunities
- Dynamic imports for heavy components
- Transition animations

### Accessibility Features
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Related Components
- RoleStatus: Status indicators
- BadgeMarker: Role category visualization
- PowerMeter: Quality score display
- PercentageBar: Distribution visualization

## Example Usage
```tsx
<RoleDialog
  role={selectedRole}
  onOpenChange={(open) => setSelectedRole(open ? role : null)}
/>
```

## Prompting Guide

### Key Aspects for LLMs
1. Community-Specific Language
   - Uses Berachain terminology
   - Maintains playful bear theme
   - Incorporates community metrics

2. Visual Hierarchy
   - Main stats prominently displayed
   - Secondary information in expandable sections
   - Clear status indicators

3. Data Presentation
   - Numerical data with context
   - Relative metrics (percentages, ranks)
   - Temporal changes (14-day window)

### Common Modifications
1. Adding New Metrics
   - Update types in `types.ts`
   - Add visualization in dialog
   - Include in analysis section

2. Styling Updates
   - Use Tailwind classes
   - Follow dark theme pattern
   - Maintain responsive design

3. Content Changes
   - Update status messages
   - Modify tooltips
   - Adjust analysis text

### Integration Points
1. Data Layer
   - BigQuery data source
   - Role change tracking
   - Quality score calculation

2. UI Components
   - Status indicators
   - Metric visualizations
   - Interactive elements

3. State Management
   - Modal visibility
   - Role selection
   - Data updates
