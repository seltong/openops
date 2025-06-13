import { Static, Type } from '@sinclair/typebox';
import { OpenOpsId } from '../common/id-generator';
import { OrganizationRole, UserStatus } from './user';

export * from './user';
export * from './user-dto';

export const CreateUserRequestBody = Type.Object({
  email: Type.String(),
  password: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  trackEvents: Type.Boolean(),
  newsLetter: Type.Boolean(),
  referringUserId: Type.Optional(OpenOpsId),
  verified: Type.Boolean(),
  organizationId: Type.String() || Type.Null(),
  externalId: Type.Optional(Type.String()),
  organizationRole: Type.Enum(OrganizationRole),
});

export type CreateUserRequestBody = Static<typeof CreateUserRequestBody>;

export const UpdateUserRequestBody = Type.Object({
  status: Type.Optional(Type.Enum(UserStatus)),
  organizationRole: Type.Optional(Type.Enum(OrganizationRole)),
});

export type UpdateUserRequestBody = Static<typeof UpdateUserRequestBody>;

export const UpdateTrackingRequestBody = Type.Object({
  trackEvents: Type.Boolean(),
});

export type UpdateTrackingRequestBody = Static<
  typeof UpdateTrackingRequestBody
>;
