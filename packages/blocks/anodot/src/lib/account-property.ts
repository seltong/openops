import { DropdownState, Property } from '@openops/blocks-framework';
import { authenticateUserWithAnodot } from './common/auth';
import { AnodotUserAccount, getAnodotUsers } from './common/users';

export function accountProperty() {
  return Property.MultiSelectDropdown({
    displayName: 'Accounts',
    description: 'A list of available Umbrella accounts',
    refreshers: ['auth'],
    required: true,
    options: async ({ auth }: any) => {
      return getAccountDropdownState(auth);
    },
  });
}

export function accountSingleSelectProperty() {
  return Property.Dropdown({
    displayName: 'Account',
    description: 'A list of available Umbrella accounts',
    refreshers: ['auth'],
    required: true,
    options: async ({ auth }: any) => {
      return getAccountDropdownState(auth);
    },
  });
}

async function getAccountDropdownState(
  auth: any,
): Promise<DropdownState<unknown>> {
  if (!auth) {
    return {
      disabled: true,
      options: [],
      placeholder: 'Please authenticate first',
    };
  }

  try {
    const anodotTokens = await authenticateUserWithAnodot(
      auth.authUrl,
      auth.username,
      auth.password,
    );

    const user = await getAnodotUsers(auth.apiUrl, anodotTokens);

    if (!user || !user.accounts || user.accounts.length === 0) {
      return {
        disabled: true,
        options: [],
        placeholder: 'No user accounts found in Umbrella.',
      };
    }

    return {
      disabled: false,
      options: user.accounts.map((account: AnodotUserAccount) => ({
        label: account.accountName,
        value: {
          accountId: account.accountId,
          accountKey: account.accountKey,
          divisionId: account.divisionId,
          accountName: account.accountName,
        },
      })),
    };
  } catch (error) {
    return {
      disabled: true,
      error: (error as Error).message,
      options: [],
      placeholder: 'Could not fetch Umbrella user accounts',
    } as DropdownState<unknown>;
  }
}
