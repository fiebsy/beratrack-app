# Glossary Component Documentation

## Directory Structure

```
src/components/glossary/
├── dialog/
│   ├── index.tsx             # Main dialog component
│   └── sections/             # Dialog section components
├── metrics/                  # Visualization components
│   ├── percentage-bar.tsx    # Role distribution visualization
│   └── power-meter.tsx      # Quality score visualization
├── status/                  # Status-related components
│   ├── badge-marker.tsx     # Role category badge
│   └── role-status.tsx      # Role attainability status
├── table/                   # Table components
│   ├── columns.tsx          # Table column definitions
│   └── index.tsx            # Main table component
├── types/                   # Type definitions
│   └── index.ts             # Shared types
└── utils/                   # Utility functions
    ├── quality-tier.ts      # Quality score calculations
    └── utils.ts             # Shared utility functions
```

## Key Components

### RoleDialog (dialog/index.tsx)
The main dialog component that displays detailed information about a selected role.

**Features:**
- Header with role name, category badge, and attainability status
- Role description section
- Community-styled analysis section with emoji bullet points
- Distribution statistics with percentage visualization
- Quality score section with power meter visualization
- Responsive layout with mobile optimization

### RoleStatus (status/role-status.tsx)
Displays the attainability status of a role with two variants:

**Table View (default):**
- Icon with tooltip for all statuses
- Badge on the left side for OPEN roles only

**Dialog View (badge):**
- Icon with tooltip
- Badge on the right side for all statuses

### BadgeMarker (status/badge-marker.tsx)
Visual indicator for role categories with consistent styling:

**Categories:**
- NFT (Fuchsia)
- COMMUNITY (Sky)
- SERVICE (Amber)
- SYSTEM (Emerald)
- TEAM (Rose)
- UNCLEAR (Gray)

## Styling Conventions

### Colors
- Background: N930 (#191919)
- Text: Foreground (white) and muted-foreground (gray)
- Accents:
  - GNEON: Success/Open states
  - RNEON: Error/Closed states
  - Orange: Restricted states

### Typography
- Font Sizes: 8px (badges) to 24px (headings)
- Font Families: System default, Mono for numbers
- Line Heights: 18px (badges) to normal

## State Management

### Dialog State
- Controlled through `role` and `onOpenChange` props
- Body scroll lock when dialog is open
- Click outside and escape key handlers

### Role Data
- Fetched from BigQuery tables
- Cached and updated periodically
- Includes:
  - Basic role information
  - Activity metrics
  - Quality scores
  - Change tracking

## Performance Considerations

### Optimizations
- Lazy-loaded dialog component
- Memoized calculations for quality tiers
- Efficient number formatting
- Responsive image loading

### Best Practices
- Use Server Components where possible
- Minimize client-side JavaScript
- Implement proper error boundaries
- Handle loading states gracefully

## Future Considerations

### Extensibility
- Support for new role categories
- Additional visualization options
- Enhanced filtering capabilities
- Real-time updates

### Maintenance
- Regular data freshness checks
- Performance monitoring
- Error tracking
- User feedback collection

## Related Components

### Table Components
- Columns configuration
- Sorting functionality
- Filtering options
- Pagination controls

### Metric Components
- PowerMeter: Quality score visualization
- PercentageBar: Distribution visualization
- Future metrics visualization components

## Example Usage

```tsx
// Table implementation
<RoleTable
  data={roles}
  onRowClick={handleRoleSelect}
/>

// Dialog implementation
<RoleDialog
  role={selectedRole}
  onOpenChange={handleDialogClose}
/>
```

## LLM Prompting Guide

When working with these components, consider:

1. **Component Organization:**
   - Keep dialog sections modular
   - Maintain clear separation of concerns
   - Follow established naming conventions

2. **Styling:**
   - Use Tailwind classes consistently
   - Follow the color system
   - Maintain responsive design patterns

3. **State Management:**
   - Handle loading states
   - Implement error boundaries
   - Manage side effects properly

4. **Performance:**
   - Optimize heavy calculations
   - Implement proper memoization
   - Consider code splitting

5. **Documentation:**
   - Update this document when adding features
   - Document complex logic inline
   - Keep type definitions current
