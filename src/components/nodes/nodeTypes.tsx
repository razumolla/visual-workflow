/* eslint-disable @typescript-eslint/no-explicit-any */

import GenericNode from "./GenericNode";

export const nodeTypes = {
  webhook: (props: any) => <GenericNode {...props} type="webhook" />,
  code: (props: any) => <GenericNode {...props} type="code" />,
  http: (props: any) => <GenericNode {...props} type="http" />,
  smtp: (props: any) => <GenericNode {...props} type="smtp" />,
};
