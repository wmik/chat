import { type ActionFunctionArgs } from 'react-router';
import {
  authenticateUser,
  registerUser,
  listUserOrganizations
} from '~/database/auth.server';
import slugify from 'slugify';
import { uid } from '~/misc';
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace';

export async function login({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { email, organization } = Object.fromEntries(formData) as Record<
    string,
    string | undefined
  >;
  let organizations = await listUserOrganizations(email as string);

  async function onSuccess(code: string) {
    let url = new URL(request.url);

    url.pathname = `/magic`;
    url.searchParams.append('code', code);
    console.log(url.toString());
  }

  organization = organization
    ? organization
    : organizations?.slice()?.shift()?.id;

  if (email && organization) {
    let code = await authenticateUser(email, organization);

    onSuccess(code as string);

    return {
      data: {
        code
      },
      errors: null,
      metadata: {
        action: 'login',
        timestamp: new Date().toISOString()
      }
    };
  }

  return {
    data: { email, organizations },
    errors: null,
    metadata: {
      action: 'login',
      timestamp: new Date().toISOString()
    }
  };
}

export async function register({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { name, email, organization } = Object.fromEntries(formData) as Record<
    string,
    string
  >;

  try {
    let membership = await registerUser(
      { role: 'OWNER' },
      {
        name: organization,
        custom: {},
        slug: slugify(`${organization}-${uid(4)}`)?.toLowerCase()
      },
      {
        name,
        email
      }
    );

    return {
      data: { membership },
      errors: null,
      metadata: {
        action: 'register',
        timestamp: new Date().toISOString()
      }
    };
  } catch (err: any) {
    let errors = [];

    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        errors.push('Email is already registered.');
      } else {
        errors.push(err.message);
      }
    } else {
      errors.push(err);
    }

    return {
      data: null,
      errors,
      metadata: {
        action: 'register',
        timestamp: new Date().toISOString()
      }
    };
  }
}
