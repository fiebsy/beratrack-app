# Role Table Component Documentation

## Overview
The Role Table component (`index.tsx`, `columns.tsx`) provides a comprehensive view of Discord roles in the Berachain community. It features sortable columns, filtering capabilities, and interactive role details.

## Component Architecture

### Main Files
- `src/components/glossary/table/index.tsx`: Main table component
- `src/components/glossary/table/columns.tsx`: Column definitions
- `src/components/glossary/types.ts`: Type definitions
- `src/lib/bigquery/glossary.ts`: Data fetching
- `src/components/glossary/role-filter.tsx`: Filter controls

### Data Flow
1. Data fetched from BigQuery
2. Processed through TanStack Table
3. Rendered with sorting and filtering
4. Triggers role dialog on row click

## Key Features

### 1. Table Structure
- Role name with badge
- Distribution metrics
- 14-day changes
- Quality score ("Vibe Check")
- Role status

### 2. Interactive Elements
- Sortable columns
- Role category filtering
- Search functionality
- Row click for details

### 3. Data Visualization
- Badge markers for role types
- Change indicators (up/down arrows)
- Quality score meters
- Status badges

## Column Configuration

### Role Name Column
- Badge marker
- Role name
- Default sort: alphabetical

### Distribution Column
- Active user count
- Percentage visualization
- Tooltip with details

### 14-Day Changes Column
- Net change display
- Color-coded indicators
- Tooltip with additions/removals

### Quality Score Column
- Power meter visualization
- Rank information
- Tooltip with analysis

### Status Column
- Status badge
- Icon with tooltip
- Color-coded indicators

## State Management
- Sorting state
- Filter state
- Column visibility
- Selected role state

## Dependencies
- TanStack Table v8
- Phosphor Icons
- Tailwind CSS
- Custom components

## Future Considerations

### Extensibility Points
1. Additional columns
2. Enhanced filtering
3. Bulk actions
4. Export functionality

### Performance Optimizations
- Virtual scrolling
- Pagination
- Memoized components
- Optimistic updates

### Accessibility Features
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

## Related Components
- SearchInput: Role search
- RoleFilter: Category filtering
- RoleDialog: Detailed view
- BadgeMarker: Role type indicator

## Example Usage
```tsx
<GlossaryTable data={glossaryData} />
```

## Prompting Guide

### Key Aspects for LLMs
1. Table Structure
   - Column configuration
   - Sorting behavior
   - Filter implementation

2. Data Handling
   - BigQuery integration
   - Data transformation
   - State updates

3. Visual Elements
   - Badge system
   - Metric displays
   - Status indicators

### Common Modifications
1. Adding Columns
   - Update column definitions
   - Add cell components
   - Configure sorting

2. Enhancing Filters
   - Add filter options
   - Update filter logic
   - Modify UI elements

3. Styling Updates
   - Table layout
   - Row appearance
   - Interactive states

### Integration Points
1. Data Layer
   - BigQuery queries
   - Data processing
   - Type definitions

2. UI Components
   - Cell renderers
   - Filter components
   - Interactive elements

3. State Management
   - Table state
   - Filter state
   - Selection state

### Best Practices
1. Performance
   - Minimize rerenders
   - Optimize sorting
   - Efficient filtering

2. Accessibility
   - Semantic markup
   - Keyboard support
   - Screen reader compatibility

3. Responsiveness
   - Mobile layout
   - Column priority
   - Touch interactions
