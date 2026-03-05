import { Pencil } from "lucide-react";

const LabelsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Pencil className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg">Chỉnh sửa nhãn</p>
    </div>
  );
};

export default LabelsPage;
