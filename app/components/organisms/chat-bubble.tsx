import {
  ClipboardIcon,
  InfoIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TriangleAlertIcon
} from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';

export type Action = 'copy' | 'like' | 'dislike' | 'report' | 'info';
export type Variants = 'left' | 'right';

export type ChatBubbleProps = {
  actions?: Action[] | boolean;
  data?: { [key: string]: any };
  onClick?(action: string): void;
  variant: Variants;
};

export const ACTIONS = {
  COPY: 'copy',
  LIKE: 'like',
  DISLIKE: 'dislike',
  REPORT: 'report',
  INFO: 'info'
};

const VARIANTS = {
  left: {
    classes: {
      // container: 'bg-accent-foreground text-background self-start', // dark
      container: 'self-start w-full',
      author: '', //'text-accent'
      text: 'font-serif'
    },
    content: { author: 'AI' }
  },
  right: {
    classes: {
      container: 'bg-muted-foreground/10 self-end ml-auto w-fit',
      author: 'text-accent-foreground',
      text: ''
    },
    content: { author: 'ME' }
  }
};

export function ChatBubble({
  actions,
  data,
  onClick,
  variant = 'left'
}: ChatBubbleProps) {
  let { classes, content } = VARIANTS[variant];

  return (
    <div className="group">
      <div className={cn(classes.container, 'rounded-xl p-4')}>
        <p
          className={cn(
            classes.author,
            'text-[10px] font-bold mb-2 capitalize'
          )}
          children={content.author}
        />
        <Markdown
          className={cn(classes.text)}
          options={{
            overrides: {
              h1: {
                props: {
                  className: 'font-semibold text-4xl mb-1 mt-4'
                }
              },
              h2: {
                props: {
                  className: 'font-semibold text-2xl mb-1 mt-4'
                }
              },
              h3: {
                props: {
                  className: 'font-semibold text-xl mb-1 mt-4'
                }
              },
              h4: {
                props: {
                  className: 'font-semibold text-lg mb-1 mt-4'
                }
              },
              h5: {
                props: {
                  className: 'font-semibold text-base mb-1 mt-4'
                }
              },
              h6: {
                props: {
                  className: 'font-semibold text-base mb-1 mt-4'
                }
              },
              p: {
                props: {
                  className: 'mb-1 whitespace-pre-line'
                }
              },
              a: {
                props: {
                  className: 'underline text-blue-500'
                }
              },
              ul: {
                props: {
                  className: 'list-disc pl-6'
                }
              },
              ol: {
                props: {
                  className: 'list-decimal pl-6'
                }
              },
              table: {
                props: {
                  className: 'w-full border-collapse mb-1'
                }
              },
              th: {
                props: {
                  className: cn(
                    'p-2 border',
                    variant === 'left'
                      ? 'border-accent'
                      : 'border-accent-foreground'
                  )
                }
              },
              tr: {
                props: {
                  className: cn(
                    'p-2 border',
                    variant === 'left'
                      ? 'border-accent'
                      : 'border-accent-foreground'
                  )
                }
              },
              td: {
                props: {
                  className: cn(
                    'p-2 border',
                    variant === 'left'
                      ? 'border-accent'
                      : 'border-accent-foreground'
                  )
                }
              },
              pre: {
                props: {
                  className: cn(
                    'p-2',
                    // variant === 'left'
                    //   ? 'bg-muted-foreground/20 text-green-400'
                    //   : 'bg-muted text-rose-700'
                    'bg-muted text-rose-700'
                  )
                }
              }
            }
          }}
          children={data?.content ?? ''}
        />
      </div>
      {actions ? (
        <div className="flex gap-2 py-2 transition-opacity opacity-0 group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-description={ACTIONS.COPY}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onClick?.(ACTIONS.COPY)}
              >
                <ClipboardIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-description={ACTIONS.LIKE}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onClick?.(ACTIONS.LIKE)}
              >
                <ThumbsUpIcon className="text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Like</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-description={ACTIONS.DISLIKE}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onClick?.(ACTIONS.DISLIKE)}
              >
                <ThumbsDownIcon className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dislike</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-description={ACTIONS.REPORT}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onClick?.(ACTIONS.REPORT)}
              >
                <TriangleAlertIcon className="text-orange-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Report</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-description={ACTIONS.INFO}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onClick?.(ACTIONS.INFO)}
              >
                <InfoIcon className="text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Information</TooltipContent>
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
}
