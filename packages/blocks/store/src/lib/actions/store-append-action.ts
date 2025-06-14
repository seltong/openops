import { createAction, Property, Validators } from '@openops/blocks-framework';
import { common, getScopeAndKey } from './common';

export const storageAppendAction = createAction({
  name: 'append',
  displayName: 'Append',
  description: 'Append to a value in storage',
  errorHandlingOptions: {
    continueOnFailure: {
      hide: true,
    },
    retryOnFailure: {
      hide: true,
    },
  },
  props: {
    key: Property.ShortText({
      displayName: 'Key',
      required: true,
      validators: [Validators.maxLength(128)],
    }),
    value: Property.ShortText({
      displayName: 'Value',
      required: true,
    }),
    separator: Property.ShortText({
      displayName: 'Separator',
      description: 'Separator between added values, use \\n for newlines',
      required: false,
    }),
    store_scope: common.store_scope,
  },
  async run(context) {
    const { key, scope } = getScopeAndKey({
      runId: context.run.id,
      isTest: context.run.isTest,
      key: context.propsValue['key'],
      scope: context.propsValue.store_scope,
    });
    const oldValue = (await context.store.get(key, scope)) || '';
    if (typeof oldValue !== 'string') {
      throw new Error(`Key ${context.propsValue.key} is not a string`);
    }
    const appendValue = context.propsValue.value;
    let separator = context.propsValue.separator || '';
    separator = separator.replace(/\\n/g, '\n'); // Allow newline escape sequence
    const newValue =
      oldValue + (oldValue.length > 0 ? separator : '') + appendValue;
    return await context.store.put(key, newValue, scope);
  },
});
