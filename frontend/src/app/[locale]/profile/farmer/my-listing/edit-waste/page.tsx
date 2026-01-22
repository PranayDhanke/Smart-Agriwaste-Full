import EditWaste from "@/components/page/waste/wasteforms/EditWaste";
import { connection } from "next/server";

const page = async () => {
  await connection();
  return (
    <div>
      <EditWaste />
    </div>
  );
};

export default page;
