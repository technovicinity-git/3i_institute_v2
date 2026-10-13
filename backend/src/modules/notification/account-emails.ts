import { prisma } from "#/lib/prisma";
import type { NotificationCategory } from "#/modules/notification/catalog";
import type { NotificationRecipient } from "#/modules/notification/service";
import { emailService } from "#/modules/email/service";
import type {
  EmailTemplateData,
  EmailTemplateName,
} from "#/modules/email/templates/index";

// Learner profiles have no email address: learner emails go to the account
// holder behind each profile. A parent with two children in the same batch
// gets one email naming both, not two.

export interface AccountHolder {
  email: string;
  firstName: string;
  timezone: string;
  // Display names of this account's learner profiles among the recipients.
  learnerNames: string[];
}

interface EmailAccountHoldersInput<TName extends EmailTemplateName> {
  recipients: NotificationRecipient[];
  category: NotificationCategory;
  template: TName;
  data: (account: AccountHolder) => EmailTemplateData<TName>;
}

export async function emailAccountHolders<TName extends EmailTemplateName>(
  input: EmailAccountHoldersInput<TName>,
): Promise<void> {
  const profileIdsByAccount = new Map<string, Set<string>>();
  for (const { userId, learnerProfileId } of input.recipients) {
    const ids = profileIdsByAccount.get(userId) ?? new Set<string>();
    if (learnerProfileId) ids.add(learnerProfileId);
    profileIdsByAccount.set(userId, ids);
  }
  const accountIds = [...profileIdsByAccount.keys()];
  if (accountIds.length === 0) return;

  const [accounts, optOuts] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: accountIds }, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        timezone: true,
        learnerProfiles: {
          where: { deletedAt: null },
          select: { id: true, displayName: true },
        },
      },
    }),
    // Account-level "no emails for this category" settings. Preferences
    // only store changes from the catalog defaults.
    prisma.notificationPreference.findMany({
      where: {
        userId: { in: accountIds },
        learnerProfileId: null,
        category: input.category,
        channel: "EMAIL",
        enabled: false,
      },
      select: { userId: true },
    }),
  ]);
  const optedOut = new Set(optOuts.map((pref) => pref.userId));

  const messages = accounts
    .filter((account) => !optedOut.has(account.id))
    .map((account) => {
      const profileIds = profileIdsByAccount.get(account.id) ?? new Set();
      const learnerNames = account.learnerProfiles
        .filter((profile) => profileIds.has(profile.id))
        .map((profile) => profile.displayName);
      return {
        to: account.email,
        data: input.data({
          email: account.email,
          firstName: account.firstName,
          timezone: account.timezone || "UTC",
          learnerNames,
        }),
      };
    });

  await emailService.sendMany({ template: input.template, messages });
}
