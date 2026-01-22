import SinglePurchase from "@/modules/profile/buyer/SinglePurchase";
import { connection } from "next/server";
import React from "react";

const page = async () => {
  await connection();
  return <SinglePurchase />;
};

export default page;
