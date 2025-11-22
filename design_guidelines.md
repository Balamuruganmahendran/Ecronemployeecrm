# Employee LMS Design Guidelines

## Design Approach: Modern Enterprise System

**Selected Approach**: Design System-based approach inspired by Linear's clean interfaces and Notion's information density, combined with enterprise dashboard best practices.

**Key Principles**:
- Clarity and efficiency over decoration
- Consistent information hierarchy
- Scannable data displays
- Purposeful use of space

---

## Typography System

**Font Stack**: Inter (Google Fonts) for all text
- **Headings**: 
  - H1: text-3xl font-semibold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-lg font-medium (Card titles, Table headers)
- **Body Text**: text-sm font-normal (Default for all content)
- **Labels**: text-xs font-medium uppercase tracking-wide (Form labels, status badges)
- **Data/Numbers**: text-base font-semibold tabular-nums (Statistics, counts)

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-6, gap-6 (card interiors)
- Page spacing: p-8, gap-8 (major sections)

**Layout Structure**:
- **Two-column admin layout**: Fixed sidebar (w-64) + main content area
- **Single-column employee layout**: Top navigation + centered content (max-w-4xl)
- **Dashboard grid**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- **Content containers**: max-w-7xl mx-auto px-6

---

## Component Library

### Navigation
**Admin Sidebar**:
- Fixed left sidebar, full height
- Logo/branding at top (h-16)
- Navigation items with icons (h-10 each, pl-4)
- Active state: subtle border-l-4 treatment
- User profile section pinned to bottom

**Employee Header**:
- Horizontal navigation bar (h-16)
- Logo left, navigation center, user menu right
- Sticky positioning (sticky top-0)

### Dashboard Statistics Cards
- Grid layout for stat cards (4 columns desktop, 2 tablet, 1 mobile)
- Each card: rounded-lg border p-6
- Label at top (text-xs uppercase)
- Large number display (text-3xl font-bold)
- Trend indicator below (text-sm with arrow icon)
- Minimum height: h-32

### Data Tables
- Full-width tables with border rounded-lg
- Header row with borders and padding (px-6 py-3)
- Data rows with hover states (px-6 py-4)
- Sticky header for long tables
- Action buttons right-aligned in last column
- Alternating row treatment for readability
- Mobile: Stack as cards below md breakpoint

### Forms
- Two-column layout for forms (grid grid-cols-1 md:grid-cols-2 gap-6)
- Full-width for text areas and special fields
- Label above input (mb-2)
- Input height: h-10 with px-4
- Form sections separated with border-t pt-6 mt-6
- Submit button: full-width on mobile, auto on desktop (right-aligned)

### Task Cards
- Card-based layout with border rounded-lg p-6
- Header with task title and priority badge
- Description text-sm
- Footer with assigned date, due date, status toggle
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

### Status Badges
- Inline badges with rounded-full px-3 py-1
- Size: text-xs font-medium
- States: Pending, Approved, Rejected, Present, Absent, Completed
- Icons optional but recommended (leading icon)

### Charts & Analytics
- Chart containers: aspect-video rounded-lg border p-6
- Title above chart (text-lg font-semibold mb-4)
- Chart occupies full container width
- Use Chart.js with clean, minimal styling
- Grid layout: grid-cols-1 lg:grid-cols-2 gap-6 for multiple charts

### Modals & Dialogs
- Centered overlay with backdrop (backdrop-blur-sm)
- Modal container: max-w-md to max-w-2xl (based on content)
- Header with title and close button (pb-4 border-b)
- Content area with proper padding (p-6)
- Footer with action buttons (pt-4 border-t)

### Buttons
- Primary: h-10 px-6 rounded-lg font-medium
- Secondary: h-10 px-6 rounded-lg border font-medium
- Icon buttons: w-10 h-10 rounded-lg (square)
- Button groups: flex gap-2

### Attendance Display
- Timeline-style layout for login/logout history
- Each entry: flex items between, border-l-4 pl-4 py-3
- Time stamps in tabular-nums font
- Status indicators as colored dots (w-2 h-2 rounded-full)

---

## Page-Specific Layouts

### Login Page
- Centered card (max-w-md mx-auto)
- Logo/title at top
- Form with Employee ID and Password fields
- Remember me checkbox
- Full-width login button
- Minimal, focused design with no distractions

### Employee Dashboard
- Welcome header with name and current time
- Attendance status card (prominent, top)
- Quick stats row (total days worked, tasks pending)
- Tasks section below with cards grid
- Leave requests section at bottom

### Admin Dashboard
- 4-column stat cards row (employees, present, absent, pending leaves)
- Two-column section below: Recent activity + Quick actions
- Charts section: 2 charts side by side (attendance trends, task completion)
- Recent leave requests table

### CRUD/Management Pages
- Header with page title and "Add New" button (flex justify-between)
- Search/filter bar (flex gap-4 with inputs)
- Data table below
- Pagination at bottom (flex justify-between items-center)

### Analytics Page
- Page header with date range selector
- Chart grid (2 columns)
- Export button positioned top-right

---

## Interactions & States

**Minimal Animations**: Use only subtle transitions
- Hover states: subtle transform or opacity change
- Focus states: clear ring treatment (ring-2 ring-offset-2)
- Loading states: Simple spinner, no skeleton screens
- Page transitions: None - instant navigation

**Accessibility**: 
- All interactive elements minimum 44px touch target
- Clear focus indicators throughout
- ARIA labels for icon-only buttons
- Proper heading hierarchy maintained

---

This design creates a professional, efficient enterprise application that prioritizes clarity, usability, and information density while maintaining a modern, clean aesthetic.