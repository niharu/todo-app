import { Textarea, Button } from "@chakra-ui/react";
type Props = {
  placeholder: string;
  leftIcon: React.ReactElement;
  buttonText: string;
  inputEl: React.RefObject<HTMLTextAreaElement>;
  handleAddTodoListItem: () => void;
};
export const TodoAdd = ({
  placeholder,
  leftIcon,
  buttonText,
  inputEl,
  handleAddTodoListItem,
}: Props) => {
  return (
    <>
      <Textarea
        placeholder={placeholder}
        bgColor="white"
        mt="8"
        borderColor="gray.400"
        ref={inputEl}
      />
      <Button
        onClick={handleAddTodoListItem}
        colorScheme="blue"
        leftIcon={leftIcon}
        mt="8"
      >
        {buttonText}
      </Button>
    </>
  );
};
