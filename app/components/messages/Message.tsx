
'use client';

interface MessageProps {
    message: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
    };
}

export function Message({ message }: MessageProps) {
    const isUser = message.role === 'user';

    const baseStyle: React.CSSProperties = {
        padding: '10px',
        margin: '5px 0',
        borderRadius: '8px',
        maxWidth: '80%',
        wordBreak: 'break-word',
    };

    const userStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundColor: '#007bff',
        color: 'white',
        alignSelf: 'flex-end',
        marginLeft: 'auto',
    };

    const assistantStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundColor: '#f1f1f1',
        color: 'black',
        alignSelf: 'flex-start',
        marginRight: 'auto',
    };

    return (
        <div style={isUser ? userStyle : assistantStyle}>
            {message.content}
        </div>
    );
}
