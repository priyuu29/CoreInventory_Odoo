# Shared Components

## DataTable
Generic data table component with sorting, pagination.

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({ data, columns, ...props }: DataTableProps<T>) {
  // Implementation
}
```

## StatusBadge
Displays status with appropriate colors.

```tsx
interface StatusBadgeProps {
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'late';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700',
    waiting: 'bg-amber-100 text-amber-700',
    ready: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    late: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
```

## SearchBar
Search input with debounce.

```tsx
interface SearchBarProps {
  placeholder?: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export function SearchBar({ placeholder, onChange, debounce = 300 }: SearchBarProps) {
  // Implementation with debounce
}
```

## KanbanBoard
Kanban board layout for receipts/deliveries.

```tsx
interface KanbanBoardProps {
  columns: string[];
  children: React.ReactNode[];
}

export function KanbanBoard({ columns, children }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col, i) => (
        <div key={col} className="bg-slate-50 rounded-lg p-3">
          {children[i]}
        </div>
      ))}
    </div>
  );
}
```

## PageHeader
Page title with actions.

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-slate-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
```

## Modal
Generic modal component.

```tsx
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}
```

## ActionButtons
Common action buttons (Edit, Delete, View).

```tsx
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}
```

## FormInput
Wrapper for form inputs with label and error.

```tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```
