import { Text, TextInput } from 'react-native';

const FONT_STYLE = { fontFamily: 'Nunito' };

const patchFontIntoRender = (Component: {
  render?: (props: Record<string, unknown>, ref: unknown) => unknown;
}): void => {
  if (!Component.render) return;
  const original = Component.render;
  Component.render = (
    props: Record<string, unknown>,
    ref: unknown
  ): unknown => {
    const patchedProps = {
      ...props,
      style: [FONT_STYLE, ...(props?.style != null ? [props.style] : [])],
    };
    return original(patchedProps, ref);
  };
};

export const setGlobalStyles = (): void => {
  patchFontIntoRender(Text as Parameters<typeof patchFontIntoRender>[0]);
  patchFontIntoRender(TextInput as Parameters<typeof patchFontIntoRender>[0]);
};
