import type { CSSProperties, MouseEventHandler } from "react"

interface ButtonWithTitleProps {
    children?: any,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    style?: CSSProperties,
    className?: string,
    title: string,
    clearClassName?: boolean,
    direction?: 'UP' | 'DOWN' | 'RIGHT'
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
    } : {
        top: '100%',
        right: '50%',
        translate: '50% 0',
    }))
    return (<button onClick={onClick}
        {...props}
        className={'group  text-[large] ' + (clearClassName ? '' : 'w-[1.8vw] h-[1.8vw] hover:bg-surface0 rounded-full transition-bg duration-200 ') + className}>
        <span
            style={ds}
            className='absolute mb-0
                        pointer-events-none select-none opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100
                        px-2 py-0.5 text-[small] font-medium text-text bg-base border border-surface0 rounded-md rounded-bl-none shadow-xl
        whitespace-nowrap pointer-events-none
                    '>{title}</span>
        {children}
    </button>)
}
