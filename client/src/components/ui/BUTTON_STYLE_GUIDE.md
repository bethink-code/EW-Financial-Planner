# Global Button Style System

This application uses a comprehensive global button style system defined in `index.css`. All buttons should follow these consistent patterns.

## Button Variants

### 1. Primary Button (`.btn-primary`)
- **Use for:** Main actions, save buttons, submit forms
- **Style:** Blue background (#016991), white text
- **Example:** "Save Changes", "Add Fund", "Submit"

### 2. Secondary Button (`.btn-secondary`)
- **Use for:** Default buttons, neutral actions
- **Style:** White background, gray text, light border
- **Example:** "Cancel", "Back", "View Details"

### 3. Destructive Button (`.btn-destructive`)
- **Use for:** Delete, remove, or dangerous actions
- **Style:** Red background (#ef4444), white text
- **Example:** "Delete", "Remove", "Reset"

### 4. Ghost Button (`.btn-ghost`)
- **Use for:** Minimal UI, icon buttons, less important actions
- **Style:** Transparent background, gray text, no border
- **Example:** Icon buttons, "Show more", subtle actions

## Button Sizes

- `.btn-sm` - Small buttons (32px height)
- `.btn-md` - Medium buttons (36px height) - Default
- `.btn-lg` - Large buttons (40px height)
- `.btn-icon-sm` - Small icon buttons (24x24px)
- `.btn-icon-md` - Medium icon buttons (32x32px)
- `.btn-icon-lg` - Large icon buttons (40x40px)

## Usage Examples

### Using Global CSS Classes Directly
```jsx
<button className="btn-secondary btn-md">
  Cancel
</button>

<button className="btn-primary btn-lg">
  Save Changes
</button>
```

### Using GlobalButton Component
```jsx
import { GlobalButton } from '@/components/ui/global-button';

<GlobalButton variant="primary" size="md">
  Save Changes
</GlobalButton>

<GlobalButton variant="secondary" size="icon-sm">
  <Plus className="h-4 w-4" />
</GlobalButton>
```

### Button Groups
```jsx
import { ButtonGroup, GlobalButton } from '@/components/ui/global-button';

<ButtonGroup>
  <GlobalButton variant="secondary">Option 1</GlobalButton>
  <GlobalButton variant="secondary">Option 2</GlobalButton>
  <GlobalButton variant="secondary">Option 3</GlobalButton>
</ButtonGroup>
```

## Special Components

### View Mode Switcher (Table/Hybrid)
The `.view-mode-switcher` class provides special styling for view toggles:
```jsx
<div className="view-mode-switcher">
  <button data-state="active">Table</button>
  <button data-state="inactive">Hybrid</button>
</div>
```

### Navigation Buttons
The `.nav-button` class is used for navigation elements with active states:
```jsx
<button className="nav-button active">Step 1</button>
<button className="nav-button">Step 2</button>
```

## Migration Guide

### Old Style → New Style
```jsx
// Old
<Button 
  style={{ backgroundColor: '#016991' }}
  className="text-white"
>

// New
<button className="btn-primary btn-md">
// or
<GlobalButton variant="primary" size="md">
```

### Inline Styles → Global Classes
```jsx
// Old
<Button
  className="bg-white text-gray-700 border hover:bg-gray-50"
>

// New  
<button className="btn-secondary btn-md">
// or
<GlobalButton variant="secondary" size="md">
```

## Benefits

1. **Consistency** - All buttons look and behave the same way
2. **Maintainability** - Change styles in one place (index.css)
3. **Performance** - CSS classes are more efficient than inline styles
4. **Accessibility** - Consistent hover, focus, and disabled states
5. **Flexibility** - Easy to add new variants or modify existing ones

## Future Considerations

When adding new buttons:
1. Check if an existing variant fits your needs
2. Use the GlobalButton component when possible
3. Apply the appropriate size class
4. Ensure proper disabled state handling
5. Test hover and focus states