import { requireNativeView } from 'expo';
import * as React from 'react';

import { LanguageIdentificationModuleViewProps } from './LanguageIdentificationModule.types';

const NativeView: React.ComponentType<LanguageIdentificationModuleViewProps> =
  requireNativeView('LanguageIdentificationModule');

export default function LanguageIdentificationModuleView(props: LanguageIdentificationModuleViewProps) {
  return <NativeView {...props} />;
}
