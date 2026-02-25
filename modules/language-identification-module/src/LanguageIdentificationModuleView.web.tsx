import * as React from 'react';

import { LanguageIdentificationModuleViewProps } from './LanguageIdentificationModule.types';

export default function LanguageIdentificationModuleView(
  props: LanguageIdentificationModuleViewProps
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
