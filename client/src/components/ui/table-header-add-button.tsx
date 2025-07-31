import { Plus } from "lucide-react";

interface TableHeaderAddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export function TableHeaderAddButton({ 
  onClick, 
  disabled = false, 
  title = "Add new item"
}: TableHeaderAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="table-header-add-button"
    >
      <Plus />
    </button>
  );
}