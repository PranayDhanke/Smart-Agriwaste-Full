import SingleMarketplace from "@/components/page/marketplace/SingleMarketplace";
import { connection } from "next/server";

const page = async () => {
  await connection();
  return (
    <div>
      <SingleMarketplace />
    </div>
  );
};

export default page;
