import { Static, Type } from '@sinclair/typebox';
import { BaseModelSchema } from '../common/base-model';
import { OpenOpsId } from '../common/id-generator';

export type OrganizationId = OpenOpsId;

export const Organization = Type.Object({
  ...BaseModelSchema,
  ownerId: OpenOpsId,
  name: Type.String(),
  tablesWorkspaceId: Type.Number(),
  newColumn: Type.Number(),
});

export type Organization = Static<typeof Organization>;
