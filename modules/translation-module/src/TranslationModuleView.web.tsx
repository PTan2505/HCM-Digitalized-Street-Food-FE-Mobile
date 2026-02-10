import * as React from 'react';

import { TranslationModuleViewProps } from './TranslationModule.types';

export default function TranslationModuleView(
  props: TranslationModuleViewProps
): React.JSX.Element {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
