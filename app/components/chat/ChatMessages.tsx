
'use client';

import { CoreMessage } from 'ai';
import { MemoizedReactMarkdown } from '@/components/markdown';
import { CodeBlock } from '@/components/ui/codeblock';
import { UserIcon, CogIcon } from '@heroicons/react/24/solid';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// FAS 2: Bygger komponenten för att rendera chatt-meddelanden
export function ChatMessages({ messages, isLoading }: { messages: CoreMessage[], isLoading: boolean }) {
    if (!messages.length) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-text-secondary">Chatthistorik kommer att visas här.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {messages.map((m, index) => (
                <div key={index} className={`flex items-start gap-3`}>
                    {m.role === 'user' ? (
                        <div className="h-8 w-8 rounded-full bg-accent-blue flex items-center justify-center text-white flex-shrink-0">
                            <UserIcon className="h-5 w-5" />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-background-tertiary flex items-center justify-center text-white flex-shrink-0">
                            <CogIcon className="h-5 w-5" />
                        </div>
                    )}
                    <div className="flex-1 pt-1">
                        <MemoizedReactMarkdown
                            className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words"
                            remarkPlugins={[remarkGfm, remarkMath]}
                            components={{
                                p({ children }) {
                                    return <p className="mb-2 last:mb-0">{children}</p>;
                                },
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    if (inline) {
                                        return <code className={className} {...props}>{children}</code>;
                                    }
                                    return (
                                        <CodeBlock
                                            key={Math.random()}
                                            language={(match && match[1]) || ''}
                                            value={String(children).replace(/\n$/, '')}
                                            {...props}
                                        />
                                    );
                                }
                            }}
                        >
                            {m.content as string}
                        </MemoizedReactMarkdown>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex items-start gap-3">
                     <div className="h-8 w-8 rounded-full bg-background-tertiary flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                        <CogIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-1 text-text-secondary animate-pulse">AI tänker...</div>
                </div>
            )}
        </div>
    );
}
