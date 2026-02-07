import { requireNativeView } from 'expo';
import * as React from 'react';

import { TranslationModuleViewProps } from './TranslationModule.types';

const NativeView: React.ComponentType<TranslationModuleViewProps> =
  requireNativeView('TranslationModule');

export default function TranslationModuleView(
  props: TranslationModuleViewProps
): React.JSX.Element {
  return <NativeView {...props} />;
}
