import { Waste } from "@/components/types/waste";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useDeleteWasteMutation } from "@/redux/api/wasteApi";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const ListWasteButtons = ({ item }: { item: Waste }) => {
  const t = useTranslations("myListing");

  const [deleteWaste, { isLoading }] = useDeleteWasteMutation();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    deleteWaste(id).then(() => {
      toast.success("deleted suceesfully");
    });
  };

  return (
    <div className="flex items-center mx-5 gap-2">
      <Link
        href={`/profile/farmer/my-listing/edit-waste?id=${item._id}`}
        className="flex-1 flex items-center justify-center border rounded-md h-8 text-xs hover:bg-green-50 hover:border-green-500 hover:text-green-700"
      >
        <Edit className="h-3.5 w-3.5 mr-1" />
        {t("buttons.edit")}
      </Link>
      <Button
        variant="outline"
        disabled={isLoading}
        size="sm"
        className="flex-1 h-8 text-xs hover:bg-red-50 hover:border-red-500 hover:text-red-700"
        onClick={() => handleDelete(item._id)}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        {isLoading ? <Loader2 className="animate-spin" /> : t("buttons.delete")}
      </Button>
    </div>
  );
};

export default ListWasteButtons;
