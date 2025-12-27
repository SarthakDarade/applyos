import React from 'react'

export function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 h-10 px-5 py-2 cursor-pointer active:scale-[0.98]"

    const variants = {
        primary: "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/5 backdrop-blur-sm",
        outline: "border border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white hover:border-white/20",
        destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        ghost: "hover:bg-white/5 text-neutral-400 hover:text-white",
        link: "text-white underline-offset-4 hover:underline"
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
