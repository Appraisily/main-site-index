# Appraisily Shared Components

This directory contains reusable UI components that are shared across all Appraisily submodules. These components ensure a consistent user experience and design language throughout the application suite.

## Available Components

- **Button**: A versatile button component with various styles and states
- More components will be added as needed

## Usage

To use these shared components in a submodule, import them directly:

```tsx
import { Button } from 'shared/components';

function MyComponent() {
  return (
    <Button 
      variant="primary" 
      size="md" 
      onClick={() => console.log('Button clicked')}
    >
      Click Me
    </Button>
  );
}
```

## Component Documentation

### Button

A flexible button component supporting multiple variants, sizes, and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'text'` | `'primary'` | Visual style of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the button |
| `fullWidth` | `boolean` | `false` | Whether button should take full width |
| `isLoading` | `boolean` | `false` | Shows a loading spinner when true |
| `icon` | `ReactNode` | - | Optional icon to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of the icon |
| All standard HTML button props | - | - | All standard button attributes are also supported |

#### Examples

```tsx
// Primary button
<Button>Primary Action</Button>

// Secondary button with right-aligned icon
<Button 
  variant="secondary" 
  icon={<ArrowRightIcon />} 
  iconPosition="right"
>
  Continue
</Button>

// Full-width outline button
<Button variant="outline" fullWidth>
  Submit Form
</Button>

// Loading state
<Button isLoading>Processing...</Button>
```

## Contributing

When adding new shared components:

1. Create a new file for the component using TypeScript and React
2. Export the component from the `index.js` file
3. Include comprehensive JSDoc comments for all props
4. Make sure the component supports all required variants and states
5. Ensure the component has good TypeScript typings
6. Add documentation to this README file

## Design Guidelines

All components should:

- Use Tailwind CSS for styling
- Be fully responsive
- Support dark mode (where appropriate)
- Meet WCAG accessibility standards
- Work with React 18+
- Include proper TypeScript typings 