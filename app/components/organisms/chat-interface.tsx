import { ChatBubble, type Variants } from '~/components/organisms/chat-bubble';
import { ChatForm } from '~/components/organisms/chat-form';

type ChatInterfaceProps = {
  data?: any;
};

export function ChatInterface({ data }: ChatInterfaceProps) {
  let { messages } = data ?? {};

  return (
    <main className="flex flex-1 flex-col gap-8 px-10 py-20 max-w-4xl mx-auto w-full">
      {messages?.map((message: any) => {
        let actions = message?.author === 'assistant' ? true : false;
        let variant: Variants =
          message?.author === 'assistant' ? 'left' : 'right';

        return (
          <ChatBubble
            actions={actions}
            key={message?.id}
            variant={variant}
            data={message}
          />
        );
      })}

      <ChatForm
        name="query"
        action="ask"
        className="mx-auto max-w-full mt-auto"
      />
    </main>
  );
}
