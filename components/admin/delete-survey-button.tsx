"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteSurveyButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onDelete() {
    if (!confirm("Delete this survey response? This cannot be undone.")) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("survey_responses")
      .delete()
      .eq("id", id);
    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Could not delete");
      return;
    }
    toast.success("Deleted");
    router.push("/admin/surveys");
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={onDelete} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Deleting…
        </>
      ) : (
        <>
          <Trash2 className="size-4" /> Delete
        </>
      )}
    </Button>
  );
}
