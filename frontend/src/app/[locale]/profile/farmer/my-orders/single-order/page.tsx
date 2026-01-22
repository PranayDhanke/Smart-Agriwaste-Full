import SingleOrder from "@/modules/profile/farmer/SingleOrder";
import { connection } from "next/server";
import React from "react";

const page = async () => {
  await connection();
  return (
    <div>
      <SingleOrder />
    </div>
  );
};

export default page;
