import dbConnect from "@/app/lib/db";
import Setting from "@/app/lib/models/settingsModel";

export async function getStripeKeys() {
  await dbConnect();

  const settings = await Setting.findOne(); 

  if (!settings?.stripePK || !settings?.stripeSK) {
    throw new Error("Stripe keys not configured in admin settings");
  }

  return {
    stripePK: settings.stripePK,
    stripeSK: settings.stripeSK,
  };
}
