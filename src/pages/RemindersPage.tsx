import { Bell } from "lucide-react";

const RemindersPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Bell className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg">Ghi chú có lời nhắc sẽ xuất hiện ở đây</p>
    </div>
  );
};

export default RemindersPage;
