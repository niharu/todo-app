import React, { memo } from "react";

import { Heading } from "@chakra-ui/react";

type Props = {
  title: string;
  fontSize: string;
  mt: string;
};
export const TodoTitle = memo(({ title, fontSize, mt }: Props) => {
  return (
    <Heading mt={mt} fontSize={fontSize} w="full">
      {title}
    </Heading>
  );
});
