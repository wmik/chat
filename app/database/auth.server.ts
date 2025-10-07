import { db } from '~/database/db.server';
import type {
  accounts,
  memberships,
  organizations
} from '~/generated/prisma/client';
import type {
  InputJsonValue,
  JsonObject
} from '~/generated/prisma/internal/prismaNamespace';
import { randomBytes } from 'node:crypto';
import { uid } from '~/misc';

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

export async function authenticateUser(email: string, organization_id: string) {
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

export async function verifyCode(token: string) {
  let authorization = await db.authorizations.findUnique({ where: { token } });

  if (!authorization) {
    return null;
  }

  let { membership } = authorization?.custom as Record<string, any>;
  let expired =
    new Date().getTime() > Number(authorization?.expired_at?.getTime());

  let session =
    membership && !expired
      ? await db.sessions.create({
          data: {
            account_id: membership?.account_id,
            organization_id: membership?.organization_id,
            id: uid()
          }
        })
      : null;

  await db.authorizations.delete({ where: { token } });

  return session;
}
