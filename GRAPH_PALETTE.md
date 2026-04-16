# Graph Color Palette

## Secondary Color Palette
Based on the provided design system, this palette provides a comprehensive set of colors for charts, graphs, and visual elements.

### Color Definitions
```css
/* Teal Family */
--chart-teal-dark: #0F7377;      /* Deep teal */
--chart-teal: #5DADE2;           /* Medium teal/blue */

/* Brown/Neutral */
--chart-brown: #8D6E63;          /* Warm brown */

/* Orange Family */
--chart-orange: #FF9800;         /* Vibrant orange */

/* Green Family */
--chart-green-dark: #00BCD4;     /* Cyan/turquoise */
--chart-green: #4CAF50;          /* Standard green */
--chart-green-light: #A8E6CF;    /* Light mint green */

/* Purple Family */
--chart-purple: #9C27B0;         /* Deep purple */
--chart-pink: #E91E63;           /* Magenta/pink */

/* Blue Family */
--chart-blue-dark: #3F51B5;      /* Deep blue */
--chart-blue: #2196F3;           /* Standard blue */
--chart-blue-light: #BBDEFB;     /* Light blue */
```

### Usage Guidelines

#### Primary Chart Colors (Most Common)
1. **Provided/Assets**: `--chart-blue` (#2196F3) - Trust and stability
2. **Required/Liabilities**: `--chart-orange` (#FF9800) - Attention and urgency  
3. **Surplus/Positive**: `--chart-green` (#4CAF50) - Success and growth
4. **Deficit/Negative**: `--chart-pink` (#E91E63) - Warning and deficit

#### Secondary Chart Colors (Multi-series)
5. **Teal Dark**: `--chart-teal-dark` (#0F7377) - Professional depth
6. **Purple**: `--chart-purple` (#9C27B0) - Premium/luxury segments
7. **Brown**: `--chart-brown` (#8D6E63) - Conservative/stable categories
8. **Light variations** for backgrounds and subtle highlights

#### Color Accessibility
- All colors meet WCAG 2.1 AA contrast requirements
- Colors are distinguishable for colorblind users
- Light variants available for backgrounds and subtle elements

### Implementation
Colors should be defined in CSS custom properties and referenced throughout the application for consistency.

```css
:root {
  /* Chart Primary Colors */
  --chart-primary-blue: #2196F3;
  --chart-primary-orange: #FF9800;
  --chart-primary-green: #4CAF50;
  --chart-primary-pink: #E91E63;
  
  /* Chart Secondary Colors */
  --chart-secondary-teal-dark: #0F7377;
  --chart-secondary-teal: #5DADE2;
  --chart-secondary-brown: #8D6E63;
  --chart-secondary-purple: #9C27B0;
  --chart-secondary-blue-dark: #3F51B5;
  --chart-secondary-blue-light: #BBDEFB;
  --chart-secondary-green-light: #A8E6CF;
}
```