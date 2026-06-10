import { validateRequest } from "@/app/auth";
import { getCurrentExchangeRate } from "../../actions/exchange";
import { getUserById } from "../../actions/users";
import BrandForm from "../../components/Forms/BrandForm";
import ChangeLocalCurrencyForm from "../../components/Forms/ChangeLocalCurrencyForm";
import ChangePasswordForm from "../../components/Forms/ChangePasswordForm";

export default async function Brand() {
  const {user} = await validateRequest();
  const userDetails = await getUserById(user?.id ?? "");
  const localCurrencyCode = userDetails?.localCurrency ?? "TRY";
  const exchangeRate = await getCurrentExchangeRate(localCurrencyCode);
  return (
    <div className="p-8 flex-col w-full">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Para Birimi & Döviz Kuru
      </h1>
      <p className="text-2xl py-2 mt-4">
        1 USD = {exchangeRate} {localCurrencyCode}
      </p>
      <ChangeLocalCurrencyForm
        initialCode={userDetails?.localCurrency ?? "TRY"}
        editingId={user?.id}
        initialDefault={userDetails?.defaultCurrency ?? "TRY"}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}
