import { deletePayment } from "../../actions/payments";
import { Trash2 } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

export default function PaymentDeleteButton({
  paymentId,
}: {
  paymentId: string;
}) {
  async function handleDelete() {
    try {
      const res = await deletePayment(paymentId);
      if (res?.ok) {
        toast.success("Tahsilat başarıyla silindi");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <button onClick={handleDelete} className="text-red-500 ml-2">
      <Trash2 className="w-4 h-4 " />
    </button>
  );
}
