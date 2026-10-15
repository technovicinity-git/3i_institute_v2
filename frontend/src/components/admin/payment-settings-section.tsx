"use client";

import { useState } from "react";
import { Landmark, Plus, Save, Trash2 } from "lucide-react";
import {
  usePaymentSettings,
  useSavePaymentSettingsMutation,
} from "@/hooks/use-subscription";
import {
  PAYMENT_ACCOUNT_TYPE_LABEL,
  type PaymentAccount,
  type PaymentAccountType,
  type PaymentSettings,
} from "@/services/subscription.service";

const inputClass = "w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm";
const labelClass = "block text-sm font-semibold text-[#0C1F33] mb-2";

function newAccount(): PaymentAccount {
  return {
    id: crypto.randomUUID(),
    type: "BANK",
    label: "",
    accountName: "",
    accountNumber: "",
    details: "",
  };
}

/** Admin's bank / mobile banking details shown on the learner subscription page. */
export function PaymentSettingsSection() {
  const { data, isLoading, isError, refetch } = usePaymentSettings();

  return (
    <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#0C1F33] flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#B8912F]" />
          Subscription payments
        </h2>
        <p className="text-sm text-[#64748B] mt-1">
          Shown on the learner Subscription page. Learners pay into these
          accounts, then submit the transaction for you to approve.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          Couldn&apos;t load payment details.{" "}
          <button onClick={() => refetch()} className="font-semibold underline">
            Try again
          </button>
        </p>
      )}

      {/* Keyed so the form picks up the saved values once loaded */}
      {data && <PaymentSettingsForm key={JSON.stringify(data)} initial={data} />}
    </div>
  );
}

function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const saveMutation = useSavePaymentSettingsMutation();
  const [settings, setSettings] = useState<PaymentSettings>(initial);
  const [price, setPrice] = useState(String(initial.monthlyPrice));

  const updateAccount = (id: string, patch: Partial<PaymentAccount>) =>
    setSettings((current) => ({
      ...current,
      accounts: current.accounts.map((account) =>
        account.id === id ? { ...account, ...patch } : account,
      ),
    }));

  const priceNumber = Number(price);
  const incompleteAccount = settings.accounts.some(
    (account) => !account.label.trim() || !account.accountNumber.trim(),
  );
  const canSave =
    price !== "" &&
    priceNumber >= 0 &&
    settings.currency.trim() !== "" &&
    !incompleteAccount &&
    !saveMutation.isPending;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="monthly-price">
            Price per profile / month
          </label>
          <input
            id="monthly-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="currency">
            Currency
          </label>
          <input
            id="currency"
            value={settings.currency}
            onChange={(e) =>
              setSettings({ ...settings, currency: e.target.value.toUpperCase() })
            }
            maxLength={10}
            placeholder="e.g. BDT, USD"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="payment-instructions">
          Instructions{" "}
          <span className="font-normal text-[#64748B]">(optional)</span>
        </label>
        <textarea
          id="payment-instructions"
          value={settings.instructions}
          onChange={(e) =>
            setSettings({ ...settings, instructions: e.target.value })
          }
          rows={3}
          maxLength={2000}
          placeholder="e.g. Use the learner's name as the payment reference."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-[#0C1F33]">Payment accounts</p>

        {settings.accounts.length === 0 && (
          <p className="text-sm text-[#64748B] border border-dashed border-[#E3E8EF] rounded-lg p-4 text-center">
            No accounts yet. Learners can&apos;t apply until you add one.
          </p>
        )}

        {settings.accounts.map((account, index) => (
          <div
            key={account.id}
            className="border border-[#E3E8EF] rounded-lg p-4 space-y-3 bg-[#FBF9F4]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#64748B] uppercase">
                Account {index + 1}
              </span>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    accounts: settings.accounts.filter((a) => a.id !== account.id),
                  })
                }
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                aria-label="Account type"
                value={account.type}
                onChange={(e) =>
                  updateAccount(account.id, {
                    type: e.target.value as PaymentAccountType,
                  })
                }
                className={`${inputClass} bg-white`}
              >
                {(Object.keys(PAYMENT_ACCOUNT_TYPE_LABEL) as PaymentAccountType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {PAYMENT_ACCOUNT_TYPE_LABEL[type]}
                    </option>
                  ),
                )}
              </select>
              <input
                aria-label="Bank or service name"
                value={account.label}
                onChange={(e) => updateAccount(account.id, { label: e.target.value })}
                placeholder={
                  account.type === "MOBILE_BANKING"
                    ? "Service, e.g. bKash (Personal)"
                    : "Bank name"
                }
                maxLength={100}
                className={`${inputClass} bg-white`}
              />
              <input
                aria-label="Account holder name"
                value={account.accountName}
                onChange={(e) =>
                  updateAccount(account.id, { accountName: e.target.value })
                }
                placeholder="Account holder name"
                maxLength={150}
                className={`${inputClass} bg-white`}
              />
              <input
                aria-label="Account or mobile number"
                value={account.accountNumber}
                onChange={(e) =>
                  updateAccount(account.id, { accountNumber: e.target.value })
                }
                placeholder={
                  account.type === "MOBILE_BANKING"
                    ? "Mobile number"
                    : "Account number"
                }
                maxLength={100}
                className={`${inputClass} bg-white font-mono`}
              />
            </div>
            <textarea
              aria-label="Extra details"
              value={account.details}
              onChange={(e) => updateAccount(account.id, { details: e.target.value })}
              rows={2}
              maxLength={1000}
              placeholder="Branch, routing / SWIFT code, or notes like “Send Money, not Payment”"
              className={`${inputClass} bg-white resize-none`}
            />
          </div>
        ))}

        <button
          onClick={() =>
            setSettings({ ...settings, accounts: [...settings.accounts, newAccount()] })
          }
          disabled={settings.accounts.length >= 20}
          className="flex items-center gap-2 px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add account
        </button>
      </div>

      {incompleteAccount && (
        <p className="text-sm text-orange-600">
          Each account needs a name and an account number.
        </p>
      )}

      <button
        onClick={() =>
          saveMutation.mutate({
            ...settings,
            monthlyPrice: priceNumber,
            currency: settings.currency.trim(),
            instructions: settings.instructions.trim(),
          })
        }
        disabled={!canSave}
        className="flex items-center gap-2 px-6 py-3 bg-[#0D2B45] text-white rounded-lg text-sm font-semibold hover:bg-[#12304E] disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saveMutation.isPending ? "Saving..." : "Save payment details"}
      </button>
    </>
  );
}
