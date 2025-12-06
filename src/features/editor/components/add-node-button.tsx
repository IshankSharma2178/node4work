"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const AddNodeButton = memo(() => {
  return (
    <Button
      className={"bg-background"}
      size={"icon"}
      variant={"outline"}
      onClick={() => {}}
    >
      <PlusIcon />
    </Button>
  );
});

AddNodeButton.displayName = "AddNodeButton";
