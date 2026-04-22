import React, {type ReactNode} from 'react';
import Line from '@theme-original/CodeBlock/Line';
import type LineType from '@theme/CodeBlock/Line';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof LineType>;

export default function LineWrapper(props: Props): ReactNode {
  return <Line {...props} />;
}
