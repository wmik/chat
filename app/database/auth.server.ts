import { db } from '~/database/db.server';
import type {
  accounts,
  memberships,
  organizations
} from '~/generated/prisma/client';
import type { InputJsonValue } from '~/generated/prisma/internal/prismaNamespace';
import { randomBytes } from 'node:crypto';
import { getRequiredServerEnvVar, uid } from '~/misc';
import { createCookieSessionStorage } from 'react-router';

const sessionIdKey = '__session_id__';
const SESSION_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 120;
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: `${
      process.env.NODE_ENV === 'production' ? '__Secure-' : ''
    }chat.session-token`,
    secure: true,
    secrets: [getRequiredServerEnvVar('SESSION_SECRET')],
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRATION_MS / 1000,
    httpOnly: true
  }
});

export async function getSession(request: Request) {
  let session = await sessionStorage.getSession(request.headers.get('Cookie'));
  let initialValue = await sessionStorage.commitSession(session);
  let getSessionId = () => session.get(sessionIdKey);
  let unsetSessionId = () => session.unset(sessionIdKey);
  let commit = async () => {
    let currentValue = await sessionStorage.commitSession(session);
    return currentValue === initialValue ? null : currentValue;
  };

  return {
    session,
    async getUser() {
      let id = getSessionId();

      if (!id) {
        return null;
      }

      let _session = await db.sessions.findUnique({ where: { id } });

      return _session
        ? await db.memberships.findUnique({
            where: {
              account_id_organization_id: {
                account_id: _session?.account_id,
                organization_id: _session?.organization_id
              }
            },
            include: { account: true, organization: true }
          })
        : null;
    },
    getSessionId,
    unsetSessionId,
    signIn: async (account: string, organization: string) => {
      let _session = await db.sessions.create({
        data: {
          account_id: account,
          organization_id: organization,
          id: uid()
        }
      });
      session.set(sessionIdKey, _session.id);
    },
    signOut: () => {
      let sessionId = getSessionId();

      if (sessionId) {
        unsetSessionId();
        db.sessions.delete({ where: { id: sessionId } }).catch(() => null);
      }
    },
    commit,
    /**
     * This will initialize a Headers object if one is not provided.
     * It will set the 'Set-Cookie' header value on that headers object.
     * It will then return that Headers object.
     */
    getHeaders: async (headers: ResponseInit['headers'] = new Headers()) => {
      let value = await commit();

      if (!value) {
        return headers;
      }

      if (headers instanceof Headers) {
        headers.append('Set-Cookie', value);
      } else if (Array.isArray(headers)) {
        headers.push(['Set-Cookie', value]);
      } else {
        headers['Set-Cookie'] = value;
      }

      return headers;
    }
  };
}

type TimelessInput<T> = Omit<T, 'created_at' | 'updated_at' | 'deleted_at'>;
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type UserInput = Optional<
  TimelessInput<accounts>,
  'id' | 'email_verified' | 'role' | 'custom'
>;

export function createUser(account: UserInput) {
  return db.accounts.create({
    data: {
      ...account,
      id: account?.id ?? uid(),
      role: account?.role ?? 'USER',
      custom: account?.custom as InputJsonValue
    }
  });
}

export function createOrganization(
  organization: Optional<TimelessInput<organizations>, 'id'>
) {
  return db.organizations.create({
    data: {
      ...organization,
      id: organization?.id ?? uid(),
      custom: organization?.custom as InputJsonValue
    }
  });
}

export async function registerUser(
  membership?: TimelessInput<Partial<memberships>>,
  organization?: Optional<TimelessInput<organizations>, 'id'>,
  account?: UserInput
) {
  if (membership?.account_id && membership?.organization_id) {
    return db.memberships.create({
      data: {
        ...membership,
        role: membership.role ?? 'MEMBER',
        account_id: membership.account_id,
        organization_id: membership.organization_id,
        custom: membership?.custom as InputJsonValue
      }
    });
  }

  let user = account ? await createUser(account) : null;
  let team =
    user && organization ? await createOrganization(organization) : null;

  if (user && team) {
    return db.memberships.create({
      data: {
        account_id: user?.id,
        organization_id: team?.id,
        role: 'MEMBER',
        ...membership,
        custom: membership?.custom as InputJsonValue
      }
    });
  }
}

export async function listUserOrganizations(email: string) {
  let memberships = await db.memberships.findMany({
    where: {
      account: {
        email
      }
    },
    include: { organization: true },
    orderBy: { created_at: 'asc' }
  });

  return memberships?.map(membership => membership.organization);
}

type CompoundMembership = memberships & {
  account: accounts;
  organization: organizations;
};

export async function generateLoginCode(
  email: string,
  organization_id: string
) {
  let account = await db.accounts.findUnique({ where: { email } });

  let membership = account
    ? await db.memberships.findUnique({
        where: {
          account_id_organization_id: {
            account_id: account.id,
            organization_id
          }
        },
        include: {
          organization: true,
          account: true
        }
      })
    : null;

  if (membership) {
    let expiration = new Date();

    expiration.setHours(expiration.getHours() + 12);

    let authorization = await db.authorizations.create({
      data: {
        token: randomBytes(32).toString('base64url'),
        type: 'code',
        expired_at: expiration,
        custom: { membership }
      }
    });

    return authorization?.token;
  }

  return null;
}

export async function verifyLoginCode(token: string) {
  let authorization = await db.authorizations.findUnique({ where: { token } });

  if (!authorization) {
    return null;
  }

  let custom = authorization?.custom as Record<string, any>;
  let expired =
    new Date().getTime() > Number(authorization?.expired_at?.getTime());

  await db.authorizations.delete({ where: { token } });

  return expired ? null : custom;
}

type CheckRoleConfig = {
  account?: string[];
  organization?: string[];
};

export function checkRole(
  session: CompoundMembership,
  config: CheckRoleConfig
) {
  let accountRole = session?.account?.role;
  let organizationRole = session?.role;
  let accountCheck = config?.account?.includes(accountRole) ?? true;
  let organizationCheck =
    config?.organization?.includes(organizationRole) ?? true;

  return accountCheck && organizationCheck;
}
