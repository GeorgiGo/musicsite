import type { CSSProperties, MouseEventHandler } from "react"

interface ButtonWithTitleProps {
    children?: any,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    style?: CSSProperties,
    className?: string,
    title: string,
    clearClassName?: boolean,
    direction?: 'UP' | 'DOWN' | 'RIGHT' | 'LEFT'
}
export default function ButtonWithTitle({ children, onClick, className = '', title = '', clearClassName = false, direction = 'UP', ...props }: ButtonWithTitleProps) {
    const ds: CSSProperties = (direction == 'UP' ? {
        bottom: '100%',
        right: '50%',
        translate: '50% 0',
    } : (direction == 'RIGHT' ? {
        left: '100%',
        bottom: '50%',
        translate: '0 50%',
    } : (direction == 'LEFT' ? {
        right: '100%',
        top: '50%',
        translate: '0 -50%'
    } : {
        top: '100%',
        right: '50%',
        translate: '50% 0',
    })));
    return (<button onClick={onClick}
        {...props}
        className={'group/b ' + (clearClassName ? '' : 'w-[1.8vw] h-[1.8vw] hover:bg-surface0 rounded-full transition-bg duration-200 ') + className}>
        <span
            style={ds}
            className='absolute mb-0 px-2 py-0.5
                        pointer-events-none select-none whitespace-nowrap
            opacity-0 scale-95 rounded-md rounded-bl-none
            transition-all duration-200 ease-out 
            group-hover/b:opacity-100 group-hover/b:scale-100
                        text-[small] font-medium text-text bg-base border border-surface0 shadow-xl
       '>{title}</span>
        {children}
    </button>)
}
