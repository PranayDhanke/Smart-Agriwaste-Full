import { Waste } from "@/components/types/waste";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useDeleteWasteMutation } from "@/redux/api/wasteApi";
import { Edit, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const ListWasteButtons = ({ item }: { item: Waste }) => {
  const t = useTranslations("myListing");

  const [deleteWaste, { isLoading }] = useDeleteWasteMutation();

  const handleDelete = async (id: string) => {
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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="flex-1 h-8 text-xs hover:bg-red-50 hover:border-red-500 hover:text-red-700"
            variant="destructive"
          >
            {t("buttons.delete")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Waste?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this Waste
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => handleDelete(item._id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListWasteButtons;
