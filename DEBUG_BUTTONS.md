# Debug: FlexLayout Buttons Not Showing

## Current Status
The `onRenderTabSet` callback is implemented but buttons may not be visible yet.

## Debugging Steps

### 1. Start the App
```bash
npm start
```

### 2. Open Browser Console
Open DevTools (F12) and check for these console messages:
- `"Rendering tabset for component: navigation"`
- `"Added X buttons for navigation"`

### 3. Check If Callback is Being Called
If you DON'T see the console messages, the callback isn't being triggered.

### 4. Try Alternative Approach - Using Icons Prop

FlexLayout has an `icons` prop that might work better. Let me add that:

```typescript
// In DashboardDock.tsx, add this:
const customIcons = {
  close: (tabNode: any) => (
    <button onClick={() => console.log('Custom close')}>
      ✕
    </button>
  ),
};

// Then in Layout component:
<FlexLayout.Layout
  ref={layoutRef}
  model={model}
  factory={factory}
  onRenderTabSet={onRenderTabSet}
  icons={customIcons}  // Add this
/>
```

## Alternative Solution: Custom Tab Headers

If `onRenderTabSet` doesn't work, we can use `onRenderTab` instead to add buttons to individual tabs:

```typescript
const onRenderTab = (node: FlexLayout.TabNode, renderValues: any) => {
  const component = node.getComponent();
  
  if (component === "navigation") {
    renderValues.buttons = renderValues.buttons || [];
    renderValues.buttons.push(
      <button key="collapse" onClick={handleToggleCollapse}>
        🍔
      </button>
    );
  }
};
```

## Check FlexLayout CSS

Make sure FlexLayout's CSS is loaded properly. Check if these classes exist:
- `.flexlayout__tab_toolbar_button`
- `.flexlayout__tabset_header`

## Current Implementation Location

- File: `src/components/dashboard/DashboardDock.tsx`
- Function: `onRenderTabSet` (lines ~307-500)
- Buttons added to: `renderValues.buttons`

## Next Steps

1. Check console for the debug messages
2. If no messages → callback not triggered
3. If messages appear but no buttons → CSS issue or wrong property
4. Report back what you see in console
